game = require('./game.js')
GameRules = game.Rules
Player = game.Player

class GameManager
    
    playerCopy : (player) ->
       # newPlayer = clone(player, ['socket'])
       newPlayer = clone(player)
       newDeck = [] 
       i = player.deck.length
       newDeck[i] = null while (i--)      
       newPlayer.deck = newDeck
       return newPlayer  

    constructor:  (@io) ->
      @player1 = null
      @player2 = null
      @_turnCount = 0
    
    connect : (socket, name) ->
      
      if (not @player1) 
         deck = Player.generateDeck();
         hand = (deck.pop() for i in [1..GameRules.handSize])
         data = { turn: true, opponent: null, deck: deck, hand: hand, name: name }
         @player1 = new Player(data, socket)        
         @current = @player1
         return "Waiting for Opponent"
      else if (not @player2)
         deck = Player.generateDeck();
         hand = (deck.pop() for i in [1..GameRules.handSize])
         data = { turn: false, opponent: null, deck: deck, hand: hand, name: name  }
         @player2 = new Player(data, socket)         
      else
         console.log("No more players")      
         return "Room full"
      hiddenDeck = (null for i in [1..@player1.deck.length])
      hiddenHand = (null for i in [1..GameRules.handSize])
      p1 = {}
      p2 = {}
      p1[key] = val for key, val of @player1 when key in ["turn", "hand", "name"]
      p1.deck = hiddenDeck   
      p2[key] = val for key, val of @player2 when key in ["turn", "hand", "name"]
      p2.deck = hiddenDeck   
      opp1 = { turn: p1.turn, name: p1.name, deck: hiddenDeck, hand: hiddenHand }
      opp2 = { turn: p2.turn, name: p2.name, deck: hiddenDeck, hand: hiddenHand }
      @player1.socket.emit('startGame', p1, opp2 )
      @player2.socket.emit('startGame', p2, opp1 )
      @player1.opponent = @player2
      @player2.opponent = @player1
      @current = @player1
      currentName = @current.name
      @io.sockets.in(@current.socket.room).emit('serverMessage', { msg: "#{currentName} will play a card", turn: currentName } )
    
    updateTurn : ->
      # initial setup tour
      @_turnCount++;
      if (@_turnCount < 4) 
        opp = @current.opponent
        oppName = opp.name
        @current.turn = false
        opp.turn = true
        @io.sockets.in(@current.socket.room).emit('serverMessage', { msg: "#{oppName} will play a card", turn: oppName } )
        @current = @current.opponent
      else if (@_turnCount == 4)
        @io.sockets.in(@current.socket.room).emit('serverMessage', { msg: "#{@current.name} will play another card" } )
      else
        @current = @current.opponent
        @current.turn = true
        @current.opponent.turn = false
        @io.sockets.in(@current.socket.room).emit('serverMessage', { msg: "Normal tours started.", turn: @current.name } )
        @io.sockets.in(@current.socket.room).emit('serverMessage', { msg: "Turn: #{@current.name} Actions Left:3" } )
        @current.actionsLeft = 3
        # modify the function to work for normal tours
        @updateTurn = ->
          @current.actionsLeft--
          if (@current.actionsLeft == 0)
            opp = @current.opponent
            oppName = opp.name
            @current.turn = false
            opp.turn = true
            @io.sockets.in(@current.socket.room).emit('serverMessage', { msg: "Turn: #{oppName} Actions Left:3", turn: oppName } )
            @current = opp
            @current.actionsLeft = 3
          else
            @io.sockets.in(@current.socket.room).emit('serverMessage', { msg: "Actions Left:#{@current.actionsLeft}" } )
        
    
    processAction : (action, socket) ->
       player = if (socket.id == @player1.socket.id) then @player1 else @player2    
       oppPlayer = if (player == @player1) then @player2 else @player1
       oppResponse = {}
       response = {}
       # turn control
       if (!player.turn)
         response = { valid: false, message: "It is not your turn" } 
       else if (@_turnCount <= 4 and action.type != "play")
         response = { valid: false, message: "During setup tour you can only play a card." } 
       else if (player.checkAction(action)) 
         oppResponse.valid = response.valid = true
         playerName = player.name
         switch action.type 
          when 'draw' 
            result = {card:player.deck[player.deck.length-1]}             
            oppResult = { card: null }
            oppMessage = playerName + " has drawn a card."
          when 'attack' 
            attacker = player.field[action.from]
            defender = oppPlayer.field[action.to]
            hits = []
            success = attacker.attack / (attacker.attack + defender.defense)
            attackerHits = 1 # TODO : attacks at tour start are free, Humans second attack
            defenderHits = 0
            for i in [1..attacker.attack]
              if (Math.random() < success)
                hits.push(true)
                defenderHits++
                if (defenderHits == defender.energy) then break
              else
                hits.push(false)
            oppResult = result = {attackerHits: attackerHits, 
                                  defenderHits: defenderHits, 
                                  hits: hits}
            response.message = "#{playerName}'s #{attacker.toString()} attacking 
            #{oppPlayer.name}'s #{defender.toString()}"            
            oppMessage = response.message
          when 'play'
            playedCard = player.hand[action.from]
            oppResult = { card: playedCard }
            oppMessage = playerName + " played " + playedCard.toString()
          when 'move'
            playedCard = player.field[action.from]
            oppMessage = playerName + " moved " + playedCard.toString() 
          else 
            oppResult = result = {}      
         # notify the opponent
         oppResponse.action = action
         oppResponse.result = oppResult
         oppResponse.message = oppMessage
         oppPlayer.socket.emit('opponentAction', oppResponse)         
         response.result = result
         response.action = action         
         player.performAction( action, result)         
       else
         response = { valid: false, message: "That action is not available to you currently" } # invalid action
       # send back response
       socket.emit('actionResult', response)
       if (response.valid) then @updateTurn()
       # return response
          
             
          
Game = exports? and exports or @Game = {} 

Game.Manager = GameManager
      
# debug


# utility functions

clone = (obj, skip=[]) ->
  if not obj? or typeof obj isnt 'object'
    return obj

  if obj instanceof Date
    return new Date(obj.getTime()) 

  newInstance = new obj.constructor()

  for key of obj
    continue if key in skip
    newInstance[key] = clone obj[key]

  return newInstance

