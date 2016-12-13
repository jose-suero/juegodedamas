//utilerías generales.
var boardUtils = {
	version: "0.0.1",
	
	getCheckerInfo: function (checker) {
		if (checker === undefined) { return null; };
		return {
			coord: new Coord(
						checker.data("whereiam").data("boardRow"), 
						checker.data("whereiam").data("boardCol")
					),
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
		
		var cellAfter = $(this);
		var cellBefore = ui.draggable.data("whereiam");
		var checkerType = ui.draggable.data("type");
		
		boardUtils.insertCheckerIntoCell(ui.draggable, this);
		ui.draggable.css({"z-index": "auto"});

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
					checkerBetween.appendTo(boardUtils.getWidget(cellBetween).CapturedDiv);
					boardUtils.setCellOcupied(cellBetween, false);

					//verificar si el jugador ganó.
					var piezasContrarias = $.grep(boardUtils.getWidget(cellBetween).checkers, function(checker, index){
						return (checker.data("whereiam") && checker.data("type") != checkerType);
					});
					if (piezasContrarias.length == 0) {
						alert(checkerType + " Ganó");
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
		
		boardUtils.getWidget(cellBefore).CurrentPlayer = ui.draggable.data("type") == "azul" ? "roja" : "azul";
		if (boardUtils.getWidget(cellBefore).CurrentPlayer == "azul") {
			
		} else {
			
		}
		
		boardUtils.getWidget(cellBefore).InfoDiv
			.empty()
			.append($("<P>")
			.text("Juega " + (boardUtils.getWidget(cellBefore).CurrentPlayer == "azul" ? 
				boardUtils.getWidget(cellBefore).options.player1.name :
				boardUtils.getWidget(cellBefore).options.player2.name )));
		
	},

	canAcceptDraggable: function(draggable) {
		var droppable = $(this);
		var thisWidget = boardUtils.getWidget(droppable);
		//Permitir el movimiento solamente a recuadros que si pueden utilizarse.
		//Piezas sin coronar:
		//1. Movimiento hacia delante en la próxima fila
		var checker = boardUtils.getCheckerInfo(draggable);
		//la dirección a donde puede moverse será:
		//Si está coronada hacia cualquier dirección (direction = 0), 
		// sino está coronada y es azul hacia abajo (direction = 1) sino hacia arriba (direction = -1)
		if (thisWidget.CurrentPlayer != checker.type) {
			return false;
		}
		
		var direction = checker.isKing ? 0 : checker.type === "azul" ? 1 : -1;

		if (checker.isKing) {
			var destCoord = new Coord(droppable.data("boardRow"), droppable.data("boardCol"));
			
			if (Math.abs(checker.coord.row - destCoord.row) == 1 && Math.abs(checker.coord.col - destCoord.col) == 1) {
				//Movimiento de una sola fila, comprobar que la celda esté vacía.
				if (droppable.data("checker") === undefined) { return true; }
				else { return false; }
			} else if (Math.abs(checker.coord.row - destCoord.row) == 2 && Math.abs(checker.coord.col - destCoord.col) == 2) {
				//Movimiento de dos filas y dos columnas, comprobar que la celda esté vacía 
				//y que la del medio contenga una pieza del otro jugador
				var cellBetween = boardUtils.getCellBetween(droppable, checker.whereiam);
				var checkerBetween = cellBetween.data("checker");
				if (droppable.data("checker") === undefined && checkerBetween !== undefined && checkerBetween.data("type") != checker.type) { 
					return true;
				} else {
					return false;
				}								
			}
		} else {
			var destCoord = new Coord(droppable.data("boardRow"), droppable.data("boardCol"));
			
			if (checker.coord.row + direction == destCoord.row && Math.abs(checker.coord.col - destCoord.col) == 1) {
				//Movimiento de una sola fila, comprobar que la celda esté vacía.
				if (droppable.data("checker") === undefined) { return true; }
				else { return false; }
			} else if (checker.coord.row + (2*direction) == destCoord.row && Math.abs(checker.coord.col - destCoord.col) == 2) {
				//Movimiento de dos filas y dos columnas, comprobar que la celda esté vacía 
				//y que la del medio contenga una pieza del otro jugador
				var cellBetween = boardUtils.getCellBetween(droppable, checker.whereiam);
				var checkerBetween = cellBetween.data("checker");
				if (droppable.data("checker") === undefined && checkerBetween !== undefined && checkerBetween.data("type") != checker.type) { 
					return true;
				} else {
					return false;
				}								
			}		
		}
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
		return $(boardObj).closest(".ui-checkersGame").data("customJuegodedamas");
	},

	startDrag: function(event, ui) {
		ui.helper.css("z-index", "99");
	}

};
//coordenada del tablero
function Coord(row, col) {
	this.row = row;
	this.col = col;
};

Coord.version = "0.0.1";

Coord.getCoordFromCell = function (cell) {
	return new Coord(cell.data("boardRow"), cell.data("boardCol"));
};