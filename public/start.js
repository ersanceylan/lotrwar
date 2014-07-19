
// utilities

function showMessage(msg, cl) {  
  if (!cl) cl = "";
  var li = "<li style='display:none' class='" + cl + "'>" + msg + "</li>";
  $(li).prependTo($('#message ul')).slideDown();
}

function fillCard(card, cardDiv) {
    cardDiv.append("<h3>" + card.type + "</h3>");
    cardDiv.append("<div class='energy'>" + card.energy + "</div>");
    cardDiv.append("<div class='attack'>" + "A:" + card.attack + "</div>");
    cardDiv.append("<div class='defense'>" + "D:" + card.defense + "</div>");
}

function applyMyAction(action, result) {
  switch(action.type) {
    case "draw":
      offset = $('#myHand .open').last().position();
      var newCard = $("<div class='card open'></div>").appendTo(myHand);
      var p1 = myHand.offset();
      var p2 = myDeck.offset();
      newCard.css({  width: cardW, height: cardH, top: p2.top-p1.top, left: p2.left-p1.left, zIndex:5});
      fillCard(result.card, newCard);
      var hider = $("<div class='card closed'></div>").appendTo(newCard);
      hider.css({  width: cardW, height: cardH, position: 'absolute', top: '0px', left:'0px'});
      newCard.animate( { top: offset.top, left: offset.left+cardW+cardGap }, 1000,
       function() { 
          hider.fadeOut(1200); 
          newCard.draggable(draggableOptions); 
          newCard.css('z-index', 3);
       });
       // hider.fadeOut(2000);
       break;  
       
    case "move":
     var fieldHolder = $("#myField .cardHolder").eq(action.from);
     var movingCard = fieldHolder.children('.card');
     movingCard.children(".actionBox").hide();
     var movingLeft = action.from > action.to;
     cardMoving = true;
     var newHolder = movingLeft ? movingCard.parent().prev() : movingCard.parent().next();
     movingCard.parent().droppable( "enable" );
     newHolder.droppable( "disable" );
     movingCard.css( {zIndex: 5 } )
     var howMuch = movingLeft ? (cardW + cardGap) : (-cardW - cardGap);
     movingCard.animate( { left: '-=' + howMuch }, 1000,
               function() {
                 movingCard.parent().removeClass('full');                   
                 newHolder.addClass('full');
                 movingCard.appendTo(newHolder).css( { top: 0, left: 0}  );
                 movingCard.css( {zIndex: 3 } )
                 cardMoving = false;
               }             
      );
      console.log(myself.field);
      break; // move    
      
    case "play":              
      var droppedCard = $('#myHand .open').eq(action.from);
      console.log(droppedCard.text());
      var cardsToMove = droppedCard.nextAll('.card');              
      var fieldHolder = $("#myField .cardHolder").eq(action.to);
      fieldHolder.append(droppedCard);
      fieldHolder.droppable( "disable" );
      droppedCard.css( { top: 0, left: 0, zIndex:3 } );
      droppedCard.draggable( "disable" );
      cardsToMove.animate( { left : '-=' + (cardW + cardGap) }, 750 );
      droppedCard.one("mouseleave", function() {
          $("<img src='iconset/left-arrow.jpg' class='actionBox'></img>").appendTo(droppedCard).each(function() {
             $(this).css( {top: (droppedCard.height()/2.0-$(this).height()/2.0) + "px", left:0} ); 
             $(this).attr("action", "left");
          });
          $("<img src='iconset/right-arrow.jpg' class='actionBox'></img>").appendTo(droppedCard).each(function() {
             $(this).css( {top: (droppedCard.height()/2.0-$(this).height()/2.0) + "px", right:0} ); 
             $(this).attr("action", "right");
          });
          $("<img src='iconset/up-arrow.jpg' class='actionBox'></img>").appendTo(droppedCard).each(function() {
                $(this).css( {top: 0, left:(droppedCard.width()/2.0-$(this).width()/2.0) + "px"} ); 
                $(this).attr("action", "attackUp");
             });
          if (myself.field[action.to].type == "Elf") {
              $("<img src='iconset/left-attack.jpg' class='actionBox'></img>").appendTo(droppedCard).each(function() {
                 $(this).css( {top: 0, left:0} );
                 $(this).attr("action", "attackLeft"); 
              });
              $("<img src='iconset/right-attack.jpg' class='actionBox'></img>").appendTo(droppedCard).each(function() {
                 $(this).css( {top: 0, right:0} );
                 $(this).attr("action", "attackRight"); 
              });
          }
          droppedCard.on("mouseenter", function() {
             if (cardMoving || !myself.turn) return;
             var thisCardNo = $("#myField .cardHolder").index($(this).parent());
             if (thisCardNo != 0 && myself.field[thisCardNo-1] == null) {
                $(this).children('.actionBox').eq(0).show();
             }
             if (thisCardNo != GameRules.fieldSize-1 && myself.field[thisCardNo+1] == null) {
                $(this).children('.actionBox').eq(1).show();
             }
             if (opponent.field[thisCardNo] != null) {
                $(this).children('.actionBox').eq(2).show();
             }
             if (myself.field[thisCardNo].type == 'Elf') {
               if (thisCardNo != 0 && opponent.field[thisCardNo-1] != null) {
                   $(this).children('.actionBox').eq(3).show();
               }
               if (thisCardNo != GameRules.fieldSize-1 && opponent.field[thisCardNo+1] != null) {
                   $(this).children('.actionBox').eq(4).show();
               }           
             }           
           });
           
           droppedCard.on("mouseleave", function() {
             $(this).children('.actionBox').hide();
           });             
      });
      droppedCard.children('.actionBox').hide();
      break; // end play
      
      case "attack":
        showAttack(action, result, true);
        break; // attack
    }
}
function showAttack(action, result, attacking) {
        var attField = attacking ? "#myField" : "#oppField";
        var attPlayer = attacking ? myself : opponent;
        var defField = attacking ? "#oppField" : "#myField";
        var defPlayer = attacking ? opponent : myself;
        var fieldHolder = $(attField +" .cardHolder").eq(action.from);
        var attackingCard = fieldHolder.children('.card');
        if (attPlayer.field[action.from])
          attackingCard.children('.energy').html(attPlayer.field[action.from].energy);                
        else 
          attackingCard.children('.energy').html(0);
        fieldHolder = $(defField + " .cardHolder").eq(action.to);      
        var defendingCard = fieldHolder.children('.card');
        var hitResult = result.hits;  
        var totalHits = 0;
        for (i=0; i<hitResult.length; i++) {
           $('#hits').append('<span>H</span>');
        }
        var nextHit = 0;
        var showHit = function() {
          var h = $('#hits span').eq(nextHit);
          if (result.hits[nextHit] == 0) h.addClass('fail');
          else { totalHits++; h.addClass('success') };
          nextHit++;
          if (nextHit < hitResult.length) setTimeout(showHit, 700);
          else {
             if (defPlayer.field[action.to]) 
               defendingCard.children('.energy').html(defPlayer.field[action.to].energy);   
             else 
               defendingCard.children('.energy').html(0);
             setTimeout(clearHits, 1000);
          }
        }
        showHit();            
}

function clearHits() {
  $('#hits').html('');
  // collectDeath 
  for (i=0; i<GameRules.fieldSize; i++) {
    $("#myField .cardHolder").each(function(i) {
      var ch = $(this).children('.card');
      if (ch.length != 0 && myself.field[i] == null) {
        ch.fadeOut(1000, function() { $(this).remove(); } );
      }
    })
    $("#oppField .cardHolder").each(function(i) {
      var ch = $(this).children('.card');
      if (ch.length != 0 && opponent.field[i] == null) {
        ch.fadeOut(1000, function() { $(this).remove(); } );
      }
    })
  }
}

function applyOppAction(action, result) {
  switch(action.type) {
  case "draw":
	  offset = $('#oppHand .closed').last().position();
      var newCard = $("<div class='card closed'></div>").appendTo(oppHand);
	  var p1 = oppHand.offset();
	  var p2 = oppDeck.offset();
	  newCard.css({  width: cardW, height: cardH, top: p2.top-p1.top, left: p2.left-p1.left, zIndex:5});
	  newCard.animate( { top: offset.top, left: offset.left+cardW+cardGap }, 1000,
		   function() { 
			 newCard.css( {zIndex: 3 } )
		   }             
      );
      break;
   case "play":
      var from = action.from;
      var to = action.to;
      var card = oppHand.children('.card:eq(' + from + ')');
      var fieldHolder = oppField.children('.cardHolder:eq(' + to + ')');
      var cardsToMove = card.nextAll('.card');   
      fillCard(result.card, card);
      var hider = $("<div class='card closed'></div>").appendTo(card);
      hider.css({  width: cardW, height: cardH, position: 'absolute', top: '0px', left:'0px'});
      card.removeClass('closed').addClass('open');
      var p1 = card.offset();
      var p2 = fieldHolder.offset();
      card.animate( { top: '+=' + (p2.top - p1.top), left: '+=' + (p2.left - p1.left) }, 1000,
               function() { 
                 $(this).appendTo(fieldHolder).css( { top: 0, left: 0}  );
                 hider.fadeOut(1200); 
                 cardsToMove.animate( { left : '-=' + (cardW + cardGap) }, 750 ); 
                 card.css( {zIndex: 3 } )
               }             
      );
      opponent.field[to] = result.card; // we don't know the card at opponent hand but server told us what it was
      break;
    case "move":
     var fieldHolder = $("#oppField .cardHolder").eq(action.from);
     var movingCard = fieldHolder.children('.card');
     var movingLeft = action.from > action.to;
     cardMoving = true;
     var newHolder = movingLeft ? movingCard.parent().prev() : movingCard.parent().next();
     movingCard.css( {zIndex: 5 } )
     var howMuch = movingLeft ? (cardW + cardGap) : (-cardW - cardGap);
     movingCard.animate( { left: '-=' + howMuch }, 1000,
               function() {
                 movingCard.parent().removeClass('full');                   
                 newHolder.addClass('full');
                 movingCard.appendTo(newHolder).css( { top: 0, left: 0}  );
                 movingCard.css( {zIndex: 3 } )
                 cardMoving = false;
               }             
      );
      console.log("Opponent:");
      console.log(opponent.field);    
      break; // move
      
      case "attack":
        showAttack(action, result, false);
        break; // attack      
  }
}

// GLOBALS

var cardW = 90;
var cardH = 120;
var cardGap = 15;
var buttonW = 60;
var buttonH = 25;
var cardMoving = false; // used to disable actionBoxes on moving cards


var draggableOptions = { revert: 'invalid', cursor: 'move', // disabled: true,
     start: function( event, ui ) { $(this).css('z-index', 5) },            
     stop: function( event, ui ) { $(this).css('z-index', 3) }            
};    
     
  
  
	/*
	comp.field = new Array(GameRules.fieldSize);
	myself.field = new Array(GameRules.fieldSize);
    for (i=0; i<GameRules.fieldSize; i++) {
      comp.field[i] = myself.field[i] = null;
    }
	
    function computerAction(action) {
		if (action.type == "playCard") {
		  var from = action.from;
		  var to = action.to;
		  var card = oppHand.children('.card:eq(' + from + ')');
		  var fieldHolder = oppField.children('.cardHolder:eq(' + to + ')');
		  var cardsToMove = card.nextAll('.card');   
		  fillCard(action.card, card);
		  var hider = $("<div class='card closed'></div>").appendTo(card);
		  hider.css({  width: cardW, height: cardH, position: 'absolute', top: '0px', left:'0px'});
		  card.removeClass('closed').addClass('open');
		  var p1 = card.offset();
		  var p2 = fieldHolder.offset();
          // fieldHolder.css('border-color', 'red');
		  // card.appendTo(oppField).css( { top: p1.top - p2.top, left: p1.left - p2.left, zIndex: 5 } );
		  // card.appendTo(oppField).css( { top: , left:  } );
          // alert(p1.top + " " + p1.left + " " + p2.top + " " + p2.left);
          console.log(p1);
          console.log(p2);
		  card.animate( { top: '+=' + (p2.top - p1.top), left: '+=' + (p2.left - p1.left) }, 1000,
				   function() { 
                     $(this).appendTo(fieldHolder).css( { top: 0, left: 0}  );
					 hider.fadeOut(1200); 
					 cardsToMove.animate( { left : '-=' + (cardW + cardGap) }, 750 ); 
					 card.css( {zIndex: 3 } )
				   }             
		  );
		  comp.field[to] = action.card;
		}
		else if (action.type == "draw") {
		  offset = $('#oppHand .closed').last().position();
		  var newCard = $("<div class='card closed'></div>").appendTo(oppHand);
		  var p1 = oppHand.offset();
		  var p2 = oppDeck.offset();
		  newCard.css({  width: cardW, height: cardH, top: p2.top-p1.top, left: p2.left-p1.left, zIndex:5});
		  newCard.animate( { top: offset.top, left: offset.left+cardW+cardGap }, 1000,
				   function() { 
					 newCard.css( {zIndex: 3 } )
				   }             
          );
		}
	
	}
	*/
	
function initialize(player) {

    console.log("INITIALIZE");
    // initial hands
    myHand = $('#myHand');
    myField = $('#myField');
    oppHand = $('#oppHand');
    oppField = $('#oppField');
    gameArea = $('#gameArea');
    myDeck = $('#myDeck');
    oppDeck = $('#oppDeck');
   
    $('.field').css( { width: GameRules.fieldSize * cardW + (GameRules.fieldSize+1) * cardGap,
                      height: cardH + 2*cardGap
                  }); 
    $('button').css( { minWidth: buttonW, height: buttonH }); 
    
    for (i=0; i<GameRules.handSize; i++) {
      myHand.append($("<div class='card open'></div>").css({ top: cardGap, left: i*cardW+(i+1)*cardGap}));
      myHand.append($("<div class='cardHolder'></div>").css({ top: cardGap-1, left: i*cardW+(i+1)*cardGap-1}));
      oppHand.append($("<div class='card closed'></div>").css({ top: cardGap, left: i*cardW+(i+1)*cardGap}));
      oppHand.append($("<div class='cardHolder'></div>").css({ top: cardGap-1, left: i*cardW+(i+1)*cardGap-1}));
    }
    for (i=0; i<GameRules.fieldSize; i++) {
      myField.append($("<div class='cardHolder'></div>").css({ top: cardGap, left: i*cardW+(i+1)*cardGap}));
      oppField.append($("<div class='cardHolder'></div>").css({ top: cardGap, left: i*cardW+(i+1)*cardGap}));
    }
    myHand.children('.card').each(function(i) { fillCard(myself.hand[i], $(this)); });
    $('.card').width(cardW).height(cardH); 
    $('.cardHolder').width(cardW).height(cardH); 
    $('.hand').width(GameRules.handSize * cardW + (GameRules.handSize+2) * cardGap)
              .height(cardH + 2*cardGap);

    $('.deck').css( { width: cardW, height: cardH });
    offsetC = oppHand.children().offset();   
    $('#oppDeck').offset( { top: offsetC.top + cardGap, left: offsetC.left-100-cardW }); 
    offsetH = myHand.children().offset();   
    $('#myDeck').offset( { top: offsetH.top - cardGap, left: offsetH.left-100-cardW }); 
    $('#drawButton').offset( { top: $('#myDeck').offset().top - 3 - buttonH, left: offsetH.left-100 - .5*cardW - .5*buttonW }); 
    var topLine = oppDeck.offset().top + $('#oppDeck').height();
    var bottomLine = myDeck.offset().top;
    $('#message').offset( { top: ((topLine + bottomLine - $('#message').height())/2), left: 20 }); 
        
    $('#drawButton').click(function() {
      var action = { type: 'draw' };
      if (!myself.turn) {
        showMessage("Not your turn.", "error");
        return;
      }
      else if (!myself.checkAction(action)) {
        showMessage("Your hand is full. You can't draw.", "error");
        return;
      }
      console.log("Draw");
      socket.emit('action', { type:'draw'} );
    }); 

    // drag and drop
    $('#myField .card').droppable()
    $('#myHand .card').draggable(draggableOptions);
    $("#myField .cardHolder").droppable({
        disabled: true,
        drop: function( event, ui ) {
              $(this).addClass( "full" );
              $(this).droppable( "option", "disabled", true );
              $(this).removeClass( "empty" );
              var droppedCard = ui.draggable;
              var from = $("#myHand .open").index(droppedCard);
              var to = $("#myField .cardHolder").index($(this));
              var action = { type:'play', from: from, to: to};
              if (!myself.checkAction(action)) {
                 // undo drop
                 showMessage("You can't move your card here.");
                 return;
              }
              console.log("Action sent");
              console.log(action);
              socket.emit('action',  action);
              
        }
    });
     
   $(".actionBox").live("click", function() {
     if (!myself.turn) {
        showMessage("Not your turn.", "error");
        return;
     }
     var action = {};
     var card = $(this).parent();
     from = $("#myField .cardHolder").index(card.parent());
     action.from = from;     
     switch($(this).attr('action')) {
       case "left"  :  
         action.to = from - 1; 
         action.type = "move";
         break;
       case "attackLeft" :
         action.to = from - 1; 
         action.type = "attack";
         break;
       case "right" :  
         action.to = from + 1; 
         action.type = "move";
         break;
       case "attackRight" :
         action.to = from + 1; 
         action.type = "attack";
         break;
       case "attackUp" :  
         action.to = from; 
         action.type = "attack";
         break;
     }
     if (!myself.checkAction(action)) {
       if (action.type == "move") showMessage("You can't move like that.", "error");
       else showMessage("You can't attack like that.", "error");
       return;
     }
     console.log("Action sent");
     console.log(action);
     socket.emit('action',  action);
     /*
     else { // attack
        // ajax call
        var result = { hits: [1, 1, 0, 1, 0] };  
        var totalHits = 0;
        for (i=0; i<result.hits.length; i++) {
           $('#hits').append('<span>H</span>');
        }
        var nextHit = 0;
        var showHit = function() {
          var h = $('#hits span').eq(nextHit);
          console.log(result);
          if (result.hits[nextHit] == 0) h.addClass('fail');
          else { totalHits++; h.addClass('success') };
          nextHit++;
          if (nextHit < result.hits.length) setTimeout(showHit, 500);
          else {
             $('#hits').html('');
             myself.field[cardIndex].energy--;
             card.children('.energy').html(myself.field[cardIndex].energy);                
             comp.field[cardIndex].energy -= totalHits;
             oppField.children('.cardHolder').eq(cardIndex).find('.card .energy').html(comp.field[cardIndex].energy);
          }
        }
        showHit();            
     }
     */     
   });
   $(".actionBox").live("hover",function(){
     $(this).css({cursor:'hand'});
   });
   $('#testButton').click(function() {        
    from = Math.floor(Math.random() * oppHand.children('.card').length);
    to = Math.floor(Math.random() * 5);
    var card = { 'name': 'Hobbit', attack: 3, defense: 4, energy:7 };
    computerAction({type: 'playCard', from:from, to: to, card: card});
    comp.field[to] = card;
   });
   
   $('#compdrawButton').click(function() {
    computerAction({type: 'draw'});
   });
}
  
  
	
	
	