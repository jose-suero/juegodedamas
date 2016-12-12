$.widget("custom.juegodedamas", {
	version: "0.0.1",
	//opciones por defecto.	
	options: {
		"player1": { name: "Jugador 1" },
		"player2": { name: "Jugador 2" },
		"size": 960,
		"droppableClass": false,
		"cellBorder": 1
	},
	
	//Constructor
	_create: function () {
		this.element.addClass("ui-checkersGame");
		this.element.append(this.MainDiv = $("<DIV>")
			.prop({"id": "boardTable"})
			.css({
				//"overflow": "auto",
				"width": this.options.size + "px",
				"height": this.options.size + "px",
				"border": "1px solid black"})
		);
		this.element.append(this.ObjsDiv = $("<DIV>"));//.prop({"id": "boardObjs"}));
		this.element.append(this.InfoDiv = $("<DIV>"));//.prop({"id": "informD"}));
		this.element.append(this.CapturedDiv = $("<DIV>"));//.prop({"id": "capturedCheckers"}));
	},
	
	//Inicializador
	_init() {
		//Para lograr referenciar a este widget dentro de funciones que le dan otro sentido a la palabra clave "this"
		var thisWidget = this;
		var cellsize = (this.options.size / 8) - (2*this.options.cellBorder);	

		//todo: modificar esta función para que se pueda reinicializar el tablero.
		
		//Crear los 64 objetos que tendrán las celdas y sus referencias.
		var cells = this.cells = [];
		for (var i = 0; i < 8; i++) {
			this.cells[i] = [];
			for (var j = 0; j < 8; j++) {
				var light = j % 2 == i % 2,
				    color = (light) ? "#FFFFFF" : "#000000",
					cell = cells[i][j] = $("<DIV>")
						.data({
						    "boardRow": i,
						    "boardCol": j })
						.css({
							"backgroundColor": color,
							"width": cellsize + "px",
							"height": cellsize + "px",
							"position": "relative",
							"float": "left",
							"border": this.options.cellBorder + "px solid " + color})
						.data({
							"type": (light ? "blanca" : "negra"),
							"ocupied": false
						});
					
				if (!light) {
					cell.droppable({
						drop: boardUtils.checkerDropped,
						accept: boardUtils.canAcceptDraggable,
						activeClass: thisWidget.options.droppableClass });
				}
				
				this.MainDiv.append(cell);
			}
		}
		
		//Crear las 24 piezas y posicionarlas en su lugar
		var checkers = this.checkers = [];
		for (var i = 0; i < 24; i++) {
			var checker = $("<IMG>")
				.prop({"src": (i < 12) ? "img/blue.svg" : "img/red.svg"})
				.css({
					"width": parseInt(cellsize * .8) + "px",
					"height": parseInt(cellsize * .8) + "px"})
				.draggable({
					"revert": "invalid",
					"start": boardUtils.startDrag})
				.data({
					"type": (i<12)?"azul":"roja",
					"isKing": false });
			this.checkers.push(checker);
			thisWidget.ObjsDiv.append(checker);
			
			var desde = (checker.data("type") == "azul") ? 0 : 5,
			      cell = boardUtils.getBlackDivs(desde,desde+3,false,thisWidget)[0];
			
			boardUtils.insertCheckerIntoCell(checker, cell);
		}
	},
	
});

//utilerías generales.
var boardUtils = {
	getCheckerInfo: function (checker) {
		if (checker === undefined) { return null; };
		return {
			coord: new Coord(
						checker.data("whereiam").data("boardRow"), 
						checker.data("whereiam").data("boardCol")
					),
			type: checker.data("type"),
			isKing: checker.data("isKing")
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
		
		boardUtils.insertCheckerIntoCell(ui.draggable, this);
		ui.draggable.css({"z-index": "auto"});

		if (Math.abs(cellAfter.data("boardRow") - cellBefore.data("boardRow")) == 2) {
			//La pieza se ha movido dos filas, verificar posible captura.
			var cellBetween = boardUtils.getCellBetween(cellAfter, cellBefore);
			if (cellBetween) {
				var checkerData = boardUtils.getCheckerInfo(cellBetween.data("checker"));
				if (checkerData && checkerData.type != ui.draggable.data("type")) {
					//captura producida. Remover esa pieza.
					cellBetween.data("checker").appendTo(boardUtils.getWidget(cellBetween).CapturedDiv);
					boardUtils.setCellOcupied(cellBetween, false);
				}
			}
		}

		boardUtils.setCellOcupied(cellBefore, false);
	},

	canAcceptDraggable: function(draggable) {
		//Permitir el movimiento solamente a recuadros que si pueden utilizarse.
		//Piezas sin coronar:
		//1. Movimiento hacia delante en la próxima fila
		var checker = boardUtils.getCheckerInfo(draggable);
		//la dirección a donde puede moverse será:
		//Si está coronada hacia cualquier dirección (direction = 0), 
		// sino está coronada y es azul hacia abajo (direction = 1) sino hacia arriba (direction = -1)
		var direction = checker.isKing ? 0 : checker.type === "azul" ? 1 : -1;


		return true;		
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

Coord.getCoordFromCell = function (cell) {
	return new Coord(cell.data("boardRow"), cell.data("boardCol"));
};