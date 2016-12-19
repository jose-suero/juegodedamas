//utilerías generales.
var boardUtils = {
	version: "0.0.1",
	
	getCheckerInfo: function (checker) {
	    if (checker === undefined) { return null; };
	    var whereiam = checker.data("whereiam");

		return {
			coord: (whereiam) ? new Coord(
						checker.data("whereiam").data("boardRow"), 
						checker.data("whereiam").data("boardCol")
					) : null,
			type: checker.data("type"),
			isKing: checker.data("isKing"),
			whereiam: checker.data("whereiam")
		};
	},

	setCellOcupied: function (celda, ocupied, checker) {
		var thisWidget = boardUtils.getWidget($(celda));
		var elem = $(celda);

		if (ocupied) { 
			elem.droppable("instance").destroy();
			checker.data("whereiam", elem);
			elem.data("checker", checker);
		} else { 
			elem.droppable({
				drop: boardUtils.checkerDropped,
				accept: boardUtils.canAcceptDraggable,
				activeClass: thisWidget.options.droppableClass });
			elem.removeData("checker");
		}
		
		elem.data("ocupied", ocupied);
	},
	
	getBlackDivs: function (fRow, tRow, ocupied, widget) {
		fRow = (fRow) ? fRow : 0;
		tRow = (tRow) ? tRow : widget.celdas.length - 1;
		var result;
		for (var i = fRow; i < tRow; i++) {
			var found = $.grep(widget.cells[i], function(e, index){
				var pRet = ($(e).data("type")=="negra");
				return ocupied !== undefined ? pRet && e.data("ocupied") == ocupied: pRet;
			});

			if (result == undefined) result = found;
			else found.forEach(function (item, index) {
				result.push(item);
			});
		}
		return result;
	},
		
	checkerDropped: function(event, ui) {

        var cellAfter=$(this),
            cellBefore=ui.draggable.data("whereiam"),
            checkerType=ui.draggable.data("type"),
            thisWidget = boardUtils.getWidget(cellBefore),
            canContinueCapturing = false;

		boardUtils.insertCheckerIntoCell(ui.draggable, this);

		//1. Revisar si se capturó una pieza.
		if (Math.abs(cellAfter.data("boardRow") - cellBefore.data("boardRow")) == 2) {
			//La pieza se ha movido dos filas, verificar posible captura.
			var cellBetween = boardUtils.getCellBetween(cellAfter, cellBefore);
			if (cellBetween) {
				var checkerBetweenData = boardUtils.getCheckerInfo(cellBetween.data("checker"));
				if (checkerBetweenData && checkerBetweenData.type != checkerType) {
					//captura producida. Remover esa pieza.
					var checkerBetween = cellBetween.data("checker");
					checkerBetween.removeData("whereiam")
					checkerBetween.appendTo(thisWidget.CapturedDiv);
					boardUtils.setCellOcupied(cellBetween, false);

					//verificar si el jugador ganó.
					var piezasContrarias = $.grep(thisWidget.checkers, function(checker, index){
						return (checker.data("whereiam") && checker.data("type") != checkerType);
					});
					if (piezasContrarias.length == 0) {
						alert(checkerType + " Ganó");
					}

					//Si continúa teniendo capturas posibles con esta misma pieza se le permite seguir jugando.
					if (boardUtils.checkerHasCaptures(ui.draggable)) {
					    canContinueCapturing = true;
					}
				}
			}
		}
		
		//2. Revisar si hay una coronación.
		if (cellAfter.data("boardRow") == (ui.draggable.data("type") == "azul" ? 7 : 0) && (!ui.draggable.data("isKing"))) {
			//Coronación
			ui.draggable.data("isKing", true);
			ui.draggable.attr({ "src" : ui.draggable.data("type") == "azul" ? "img/bluec.svg" : "img/redc.svg"  });
		}

		boardUtils.setCellOcupied(cellBefore, false);
		if (!canContinueCapturing) {
		    thisWidget.CurrentPlayer = ui.draggable.data("type") == "azul" ? "roja" : "azul";
		}

		thisWidget.InfoDiv
			.empty()
			.append($("<P>")
			.text("Juega " + (thisWidget.CurrentPlayer == "azul" ? 
				thisWidget.options.player1.name :
				thisWidget.options.player2.name )));
		
	},

	canAcceptDraggable: function(draggable) {
		var droppable = $(this);
		var thisWidget = boardUtils.getWidget(droppable);
		var checker = boardUtils.getCheckerInfo(draggable);
		if (thisWidget.CurrentPlayer != checker.type) {
            //prevenir movimientos del jugador incorrecto.
			return false;
		}

        //si el jugador actual tiene capturas y la pieza a arrastrar no tiene capturas posibles.
		if (boardUtils.currentPlayerHasCaptures(draggable) && (!boardUtils.checkerHasCaptures(draggable))) {
		    return false;
        }

		var possibleMoves = boardUtils.checkerPossibleMoves(draggable);
	    var destCoord = new Coord(droppable.data("boardRow"), droppable.data("boardCol"));
		var canMoveToHere = false;
		$(possibleMoves).each(function (index, move) {
		    if ((!canMoveToHere) && move.coord.row == destCoord.row && move.coord.col == destCoord.col) {
		        canMoveToHere = true;
		    }
		});
		return canMoveToHere;
	},
	
	insertCheckerIntoCell: function(checker, cell) {
		checker.appendTo(cell);

		checker.position({
				my: "center",
				at: "center",
				of: cell
		});
			
		boardUtils.setCellOcupied(cell, true, checker);
	},
	
	getCellBetween: function (cell1, cell2) {
		cell1Coord = Coord.getCoordFromCell(cell1);
		cell2Coord = Coord.getCoordFromCell(cell2);
		
		if (Math.abs(cell1Coord.row - cell2Coord.row) == 2 && 
		    Math.abs(cell1Coord.col - cell2Coord.col) == 2) {
			
			var coord = new Coord((cell1Coord.row + cell2Coord.row) / 2, (cell1Coord.col + cell2Coord.col) / 2);
			var thisWidget = boardUtils.getWidget(cell1);
			return thisWidget.cells[coord.row][coord.col];						
			
		}
		
		return null;
	},
	
	getWidget: function (boardObj) {
	    if (boardObj.hasClass(".ui-checkersGame")) return boardObj;

		return $(boardObj).closest(".ui-checkersGame").data("customJuegodedamas");
	},

	startDrag: function(event, ui) {
		ui.helper.css("z-index", "1000");
	},

	stopDrag: function (event, ui) {
	    ui.helper.css("z-index", "auto");
    },

	currentPlayerHasCaptures: function (boardObj) {
	    var thisWidget = boardUtils.getWidget(boardObj);

	    var hasCaptures = false;

	    $(thisWidget.checkers).each(function (index, checker) {
	        if ((!hasCaptures) && checker.data("type") == thisWidget.CurrentPlayer && boardUtils.checkerHasCaptures(checker)) {
	            hasCaptures = true;
	        }
	    });

		return hasCaptures;
	},

	checkerHasCaptures: function(checker) {
		var thisWidget = boardUtils.getWidget(checker);
		var checkerMoves = boardUtils.checkerPossibleMoves(checker);

		var capturesCount = 0;

		$(checkerMoves).each(function (index, move) {
		    if (move.type == "capture") capturesCount++;
		});
    
		return capturesCount > 0;
	},

	checkerPossibleMoves: function(checker) {
		var thisWidget = boardUtils.getWidget(checker);
		var ci = boardUtils.getCheckerInfo(checker);
		if (ci.coord == null) return [];
		var direction = ci.type == "azul" ? 1 : -1;
		var result = [];
		//estos son los movimientos básicos posibles
		var possibleMoves = [{rows: direction, columns: 1},{rows: direction, columns: -1}];
		//si la pieza está coronada puede moverse en la otra dirección.
		if (ci.isKing) {
			possibleMoves.push({rows: direction *-1, columns: 1}, {rows: direction *-1, columns: -1});
		}

		$(possibleMoves).each(function (index, move) {
			var coord = new Coord(ci.coord.row + move.rows, ci.coord.col + move.columns);
			if (coord.isInsideOfBoard()) {
				//movimiento dentro de los límites del tablero.
				var cell = thisWidget.cells[coord.row][coord.col];
				if (cell.data("ocupied") && cell.data("checker").data("type") != ci.type) {
				    //la celda está ocupada por una pieza contraria. Verificar si la siguiente celda no lo está.
					var nextCoord = new Coord(coord.row + move.rows, coord.col + move.columns);
					if (nextCoord.isInsideOfBoard()) {
					    //la coordenada está dentro de los límites del tablero.
					    var nextCell = thisWidget.cells[nextCoord.row][nextCoord.col];
					    if (!nextCell.data("ocupied")) {
					        //Movimiento de captura permitido.
					        result.push({coord: nextCoord, type: "capture"});
					    }
					}
				} else if (!cell.data("ocupied")) {
				    //la celda de este movimiento no está ocupada.
				    result.push({coord: coord, type: "move"});
				}
			}

		});

	    //Si tiene al menos un movimiento de captura eliminar los que no son de captura.
		var captures = $.grep(result, function (move, index) {
		    return move.type == "capture";
		});

		if (captures && captures.length > 0) return captures;
		else return result;
	}

};
//coordenada del tablero
function Coord(row, col) {
    this.version = "0.0.1";

    this.row = row;
    this.col = col;
};

Coord.prototype.isInsideOfBoard = function () {
    return (0 <= this.row && this.row <= 7)
          && (0 <= this.col && this.col <= 7);
};

Coord.getCoordFromCell = function (cell) {
    return new Coord(cell.data("boardRow"), cell.data("boardCol"));
};