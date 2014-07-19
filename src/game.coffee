class Card
  constructor: (@type, @isWarrior = true) ->
  toString : ->
    if (@isWarrior) then return "#{@type} #{@energy} (#{@attack}/#{@defense})";
    else return "#{@type}"   # spell cards
  
class Warrior extends Card
  constructor: (type, @attack, @defense, @energy) ->
    super(type)

class Elf extends Warrior
    constructor: (energy) ->
       attack  = if (Math.random() < 0.5) then 5 else 6
       defense = if (Math.random() < 0.5) then 2 else 3
       super("Elf", attack, defense, energy)

class Dwarf extends Warrior
    constructor: (energy) ->
       attack  = if (Math.random() < 0.5) then 2 else 3
       defense = if (Math.random() < 0.5) then 5 else 6
       super("Dwarf", attack, defense, energy)

class Hobbit extends Warrior
    constructor: (energy) ->
       attack  = if (Math.random() < 0.5) then 2 else 3
       defense = if (Math.random() < 0.5) then 4 else 5
       super("Hobbit", attack, defense, energy)

class Human extends Warrior
    constructor: (energy) ->
       if (Math.random() < 0.5) 
         attack = 3
         defense = 4
       else 
         attack = 4
         defense = 3
       super("Human", attack, defense, energy)

class GameRules
  @fieldSize = 5
  @handSize = 7
  @actionsPerTurn = 3

# Common Player Class
class Player 
      
  constructor: (data, @socket) ->
    @field = new Array()
    @field.push(null) for i in [1..GameRules.fieldSize]
    @actionsLeft = GameRules.actionsPerTurn
    @opponent = null
    {@hand, @turn, @deck, @name} = data
    
  sendAction : (action) ->
    throw new Error('sendAction should be overridden')

  updateGUI : (action) ->
    # override if client has gui
    return
  
   @generateDeck = () -> 
      deck = []
      for energy in [3..8]
        deck.push(new Elf(energy))
        deck.push(new Hobbit(energy))
        deck.push(new Dwarf(energy))
        deck.push(new Human(energy))
      shuffle(deck)
  
  # should be called in the client if action is valid and server send the action data
  performAction : (action, result) ->
       # result = sendAction(action)
       switch action.type 
         when 'draw' 
            @deck.pop()
            @hand.push(result.card) # response is the new card
         when 'move' 
            from = action.from
            to = action.to
            @field[to] = @field[from]
            @field[from] = null
            if (not window?) 
              if (card) then console.log(card.toString()) for card in @field
              else console.log("Empty")
         when 'attack' 
            from = action.from
            to = action.to
            @field[from].energy -= result.attackerHits
            @opponent.field[to].energy -= result.defenderHits
            @collectDeath()
         when 'play' 
            from = action.from
            to = action.to
            removed = @hand.splice(from, 1)
            @field[to] = removed[0]
         else throw new Error("unknown action")
       @updateGUI(action)  
       return true 
  
  collectDeath : ->
    # TODO when used in attacking only check the attacker and defender
    for i in [0..GameRules.fieldSize-1] 
      if (@field[i] != null and @field[i].energy <=0) then @field[i] = null     
      if (@opponent.field[i] != null and @opponent.field[i].energy <=0) then @opponent.field[i] = null     
    
  # returns true if action is valid at this stage of the game      
  checkAction : (action) ->
       switch action.type 
         when 'draw' 
           return @deck.length > 0 and @hand.length < GameRules.handSize
         when 'move'
            from = action.from
            to = action.to
            return @field[to] == null and @field[from] != null
         when 'attack' 
            from = action.from
            to = action.to
            return @field[from] != null and @opponent.field[to] != null and 
                  (from == to or (@field[from].type == "Elf" and Math.abs(from-to) <= 1))
         when 'play' 
            from = action.from
            to = action.to
            return @hand[from] != null and @field[to] == null
         else throw new Error("unknown action")

###         
class PlayerClient extends Player
  constructor: (@name, @socket) ->
  fillServerData: (
###
  
Game = exports? and exports or @Game = {} 

Game.Rules = GameRules
Game.Player = Player

# utilities 

shuffle = (a) ->
  # From the end of the list to the beginning, pick element `i`.
  for i in [a.length-1..1]
    # Choose random element `j` to the front of `i` to swap with.
    j = Math.floor Math.random() * (i + 1)
    # Swap `j` with `i`, using destructured assignment
    [a[i], a[j]] = [a[j], a[i]]
  # Return the shuffled array.
  a  
