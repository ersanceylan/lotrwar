
function showMessage(msg, cl) {  
  if (!cl) cl = "";
  var li = "<li style='display:none' class='" + cl + "'>" + msg + "</li>";
  $(li).prependTo($('#message ul')).slideDown();
  
}


  // GLOBALS

	  var handSize = 7;
	  var fieldSize = 5;
	  var cardW = 90;
	  var cardH = 120;
	  var cardGap = 15;
	  var buttonW = 60;
	  var buttonH = 25;


      
	function cardDisplay(card) {
      return card.type + " " + card.energy + " (" + card.attack + "/" + card.defense + ")";
    }

  
  
	function fillCard(card, cardDiv) {
		cardDiv.append("<h3>" + card.type + "</h3>");
		cardDiv.append("<div class='energy'>" + card.energy + "</div>");
		cardDiv.append("<div class='attack'>" + "A:" + card.attack + "</div>");
		cardDiv.append("<div class='defense'>" + "D:" + card.defense + "</div>");
	}
  
	/*
	comp.field = new Array(fieldSize);
	human.field = new Array(fieldSize);
    for (i=0; i<fieldSize; i++) {
      comp.field[i] = human.field[i] = null;
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
	   
		$('.field').css( { width: fieldSize * cardW + (fieldSize+1) * cardGap,
						  height: cardH + 2*cardGap
					  }); 
		$('button').css( { minWidth: buttonW, height: buttonH }); 
		
		for (i=0; i<handSize; i++) {
		  myHand.append($("<div class='card open'></div>").css({ top: cardGap, left: i*cardW+(i+1)*cardGap}));
		  myHand.append($("<div class='cardHolder'></div>").css({ top: cardGap-1, left: i*cardW+(i+1)*cardGap-1}));
		  oppHand.append($("<div class='card closed'></div>").css({ top: cardGap, left: i*cardW+(i+1)*cardGap}));
		  oppHand.append($("<div class='cardHolder'></div>").css({ top: cardGap-1, left: i*cardW+(i+1)*cardGap-1}));
		}
		for (i=0; i<fieldSize; i++) {
		  myField.append($("<div class='cardHolder'></div>").css({ top: cardGap, left: i*cardW+(i+1)*cardGap}));
		  oppField.append($("<div class='cardHolder'></div>").css({ top: cardGap, left: i*cardW+(i+1)*cardGap}));
		}
		myHand.children('.card').each(function(i) { fillCard(player.hand[i], $(this)); });
		$('.card').width(cardW).height(cardH); 
		$('.cardHolder').width(cardW).height(cardH); 
		$('.hand').width(handSize * cardW + (handSize+2) * cardGap)
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
		
        var draggableOptions = { revert: 'invalid', cursor: 'move',
             start: function( event, ui ) { $(this).css('z-index', 5) },            
             stop: function( event, ui ) { $(this).css('z-index', 3) }            
		};        
		$('#drawButton').click(function() {
                  console.log("Draw");
                  console.log({ type:'draw'});
                  socket.emit('action', { type:'draw'} );

           /*
		   $.ajax({
			   url: 'actions.php',
			   dataType: 'json',
			   data: { action: 'draw' },
			   success: function(data) {
				 human.hand.push(data);
				 offset = $('#myHand .open').last().position();
				 var newCard = $("<div class='card open'></div>").appendTo(myHand);
				 var p1 = myHand.offset();
				 var p2 = myDeck.offset();
				 newCard.css({  width: cardW, height: cardH, top: p2.top-p1.top, left: p2.left-p1.left, zIndex:5});
				 // newCard.css({  width: cardW, height: cardH, top: 100, left: -100});
				 // alert(newCard.position().top + " " + newCard.position().left);
				 fillCard(data, newCard);
				 var hider = $("<div class='card closed'></div>").appendTo(newCard);
				 hider.css({  width: cardW, height: cardH, position: 'absolute', top: '0px', left:'0px'});
				 newCard.animate( { top: offset.top, left: offset.left+cardW+cardGap }, 1000,
				   function() { 
                      hider.fadeOut(1200); 
                      newCard.draggable(draggableOptions); 
                      newCard.css('z-index', 3);
                   }             
				 );
				 // hider.fadeOut(2000);
				 
				 
			  }
		   });
           */
		}); 
		// alert($.ui.draggable.options);
		// drag and drop
		$('#myField .card').droppable()
		$('#myHand .card').draggable(draggableOptions);
		$("#myField .cardHolder").droppable({
			drop: function( event, ui ) {
				  $(this).addClass( "full" );
				  $(this).droppable( "option", "disabled", true );
				  $(this).removeClass( "empty" );
				  var from = $("#myHand .card").index(ui.draggable);
				  var to = $("#myField .cardHolder").index($(this));

                  console.log("Action sent");
                  console.log({ type:'play', from: from, to: to});
                  socket.emit('action', { type:'play', from: from, to: to} );
				  
                  // alert(from + " " + to);
				  var cardsToMove = ui.draggable.nextAll('.card');              
				  $(this).append(ui.draggable);
				  // ui.draggable.css( { top: 5+$(this).position().top, left: 5+$(this).position().left, zIndex:3 } );
				  ui.draggable.css( { top: 0, left: 0, zIndex:3 } );
				  ui.draggable.draggable( "option", "disabled", true );
				  cardsToMove.animate( { left : '-=' + (cardW + cardGap) }, 750 );
				  human.field[to] = human.hand[from];                  
				  human.hand.splice(from, 1);
                  $("<img src='iconset/left-arrow.jpg' class='actionBox'></img>").appendTo(ui.draggable).each(function() {
                     $(this).css( {top: (ui.draggable.height()/2.0-$(this).height()/2.0) + "px", left:0} ); 
                     $(this).attr("action", "left");
                  });
                  $("<img src='iconset/right-arrow.jpg' class='actionBox'></img>").appendTo(ui.draggable).each(function() {
                     $(this).css( {top: (ui.draggable.height()/2.0-$(this).height()/2.0) + "px", right:0} ); 
                     $(this).attr("action", "right");
                  });
                  $("<img src='iconset/up-arrow.jpg' class='actionBox'></img>").appendTo(ui.draggable).each(function() {
                        $(this).css( {top: 0, left:(ui.draggable.width()/2.0-$(this).width()/2.0) + "px"} ); 
                        $(this).attr("action", "attackUp");
                     });
                  if (human.field[to].type == "Elf") {
                      $("<img src='iconset/left-attack.jpg' class='actionBox'></img>").appendTo(ui.draggable).each(function() {
                         $(this).css( {top: 0, left:0} );
                         $(this).attr("action", "attackLeft"); 
                      });
                      $("<img src='iconset/right-attack.jpg' class='actionBox'></img>").appendTo(ui.draggable).each(function() {
                         $(this).css( {top: 0, right:0} );
                         $(this).attr("action", "attackRight"); 
                      });
                  }
                  ui.draggable.children('.actionBox').css('opacity', '1');
			}
		});
       
       var cardMoving = false;

       $("#myField .card").live("mouseenter", function(obj,i) {
         if (cardMoving) return;
         var thisCardNo = $("#myField .cardHolder").index($(this).parent());
         // $('#message').text($('#message').text() + thisCardNo + " ");
         // $('#message').text($('#message').text() + human.field[thisCardNo].type + " ");
         // if (human.field[thisCardNo] == null) return;
         if (thisCardNo != 0 && human.field[thisCardNo-1] == null) {
            $(this).children('.actionBox').eq(0).show();
         }
         if (thisCardNo != fieldSize-1 && human.field[thisCardNo+1] == null) {
            $(this).children('.actionBox').eq(1).show();
         }
         if (comp.field[thisCardNo] != null) {
            $(this).children('.actionBox').eq(2).show();
         }
         if (human.field[thisCardNo].type == 'Elf') {
           if (thisCardNo != 0 && comp.field[thisCardNo-1] != null) {
               $(this).children('.actionBox').eq(3).show();
           }
           if (thisCardNo != fieldSize-1 && comp.field[thisCardNo+1] != null) {
               $(this).children('.actionBox').eq(4).show();
           }           
         }
		 
         // alert($(this).children('.actionBox').length);
         // $(this).children('.actionBox').show();
       });
       
       $("#myField .card").live("mouseleave", function() {
         $(this).children('.actionBox').hide();
       });
       
       $(".actionBox").live("click", function() {
         var action = $(this).attr('action');
         $(this).siblings(".actionBox").hide();
         $(this).hide();
         var card = $(this).parent();
         var cardIndex = $("#myField .cardHolder").index(card.parent());
         if (action == "left") {
           cardMoving = true;
           human.field[cardIndex-1] = human.field[cardIndex];
           human.field[cardIndex] = null;
           var newHolder = card.parent().prev();
           card.parent().droppable( "option", "disabled", false );
           newHolder.droppable( "option", "disabled", true );
           newHolder.addClass('full');
		   card.css( {zIndex: 5 } )
           card.children('.actionBox').hide();
           card.animate( { left: '-=' + (cardW + cardGap) }, 1000,
				   function() {
                     card.parent().removeClass('full');                   
                     $(this).appendTo(newHolder).css( { top: 0, left: 0}  );
					 $(this).css( {zIndex: 3 } )
                     cardMoving = false;
				   }             
		  );
         }
      
		 else if (action == "right") {
           cardMoving = true;
           human.field[cardIndex+1] = human.field[cardIndex];
           human.field[cardIndex] = null;
           console.log(cardIndex);
           var newHolder = card.parent().next();
           card.parent().droppable( "option", "disabled", false );
           newHolder.droppable( "option", "disabled", true );
           newHolder.addClass('full');
		   card.css( {zIndex: 5 } )
           card.children('.actionBox').hide();
           card.animate( { left: '+=' + (cardW + cardGap) }, 1000,
				   function() {
                     card.parent().removeClass('full');                   
                     $(this).appendTo(newHolder).css( { top: 0, left: 0}  );
					 $(this).css( {zIndex: 3 } )
                     cardMoving = false;
				   }             
		  );
         }
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
                 human.field[cardIndex].energy--;
                 card.children('.energy').html(human.field[cardIndex].energy);                
                 comp.field[cardIndex].energy -= totalHits;
                 oppField.children('.cardHolder').eq(cardIndex).find('.card .energy').html(comp.field[cardIndex].energy);
              }
            }
            showHit();            
         }          
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
  
  
	
	
	