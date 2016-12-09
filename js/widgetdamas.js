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
				"overflow": "auto",
				"width": this.options.size + "px",
				"height": this.options.size + "px",
				"border": "1px solid black"})
		);
		this.element.append(this.ObjsDiv = $("<DIV>").prop({"id": "boardObjs"}));
	},
	
	//Inicializador
	_init() {
		//Para lograr referenciar a este widget dentro de funciones que le dan otro sentido a la palabra clave "this"
		var thisWidget = this;
		var cellsize = (this.options.size / 8) - (2*this.options.cellBorder);	

		//todo: modificar esta función para que se pueda reinicializar el tablero.
		
		//Crear los 64 objetos que tendrán las celdas y sus referencias.
		var celdas = this.celdas = [];
		for (var i = 0; i < 8; i++) {
			this.celdas[i] = [];
			for (var j = 0; j < 8; j++) {
				var light = j % 2 == i % 2,
				    color = (light) ? "#FFFFFF" : "#000000",
					celda = celdas[i][j] = $("<DIV>")
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
					celda.droppable({
						drop: boardUtils.checkerDropped,
						accept: boardUtils.canAcceptDraggable,
						activeClass: thisWidget.options.droppableClass });
				}
				
				this.MainDiv.append(celda);
			}
		}
		
		//Crear las 24 piezas
		var piezas = this.piezas = [];
		for (var i = 0; i < 24; i++) {
			thisWidget.ObjsDiv.append(this.piezas[i] = $("<IMG>")
				.prop({"src": (i < 12) ? "img/blue.svg" : "img/red.svg"})
				.css({
					"width": parseInt(cellsize * .8) + "px",
					"height": parseInt(cellsize * .8) + "px"})
				.draggable({revert: "invalid"})
				.data({
					"type": (i<12)?"azul":"roja",
					"isKing": false }));
		}
		
		//Llevar las piezas a su lugar inicial.
		$(piezas).each( function (i,pieza) {
			var type = pieza.data("type");
			var desde = (type == "azul") ? 0 : 5;
			var negras =  boardUtils.getBlackDivs(desde,desde+3,false,thisWidget);
			var celda = negras[0];
			
			pieza.position({
				my: "center",
				at: "center",
				of: celda
			});
			
			boardUtils.setCellOcupied(celda, true, pieza);
		});
	},
	
});

//utilidades y objetos
var boardUtils = {
	getCheckerInfo: function (checker) {
		return {
			coord: new coord(
						checker.data("whereiam").data("boardRow"), 
						checker.data("whereiam").data("boardCol")
					),
			type: checker.data("type"),
			isKing: checker.data("isKing")
		};
	},

	setCellOcupied: function (celda, ocupied, pieza) {
		var thisWidget = $(celda).closest(".ui-checkersGame").data("customJuegodedamas");
		var elem = $(celda);

		if (ocupied) { 
			ocupied = true;
			elem.droppable("instance").destroy();
			pieza.data("whereiam", elem);
			elem.data("pieza", pieza);
		} else { 
			elem.droppable({
				drop: boardUtils.checkerDropped,
				accept: boardUtils.canAcceptDraggable,
				activeClass: thisWidget.options.droppableClass });
			elem.removeData("pieza");
		}
		
		elem.data("ocupied", ocupied);
	},
	
	getBlackDivs: function (fRow, tRow, ocupied, widget) {
		fRow = (fRow) ? fRow : 0;
		tRow = (tRow) ? tRow : widget.celdas.length - 1;
		var result;
		for (var i = fRow; i < tRow; i++) {
			var found = $.grep(widget.celdas[i], function(e, index){
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
		ui.draggable.position({
			my: "center",
			at: "center",
			of: this
		});
		
		var cellAfter = $(this);
		var cellBefore = ui.draggable.data("whereiam");

		boardUtils.setCellOcupied(cellBefore, false);
		boardUtils.setCellOcupied(cellAfter, true, ui.draggable);
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
	}
};
//coordenada del tablero
function coord(row, col) {
	this.row = row;
	this.col = col;
}