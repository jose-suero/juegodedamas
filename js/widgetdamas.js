$.widget("custom.juegodedamas", {
	version: "1.0.0",
	//opciones por defecto.	
	options: {
		"player1": { name: "Jugador 1" },
		"player2": { name: "Jugador 2" },
		"size": 960,
		"droppableClass": false,
		"cellBorder": 1
	},
	//Para mejor manejo de constantes dentro de todo este código.
	_myInternalKeys: {
		"darkCells" : "dark",
		"lightCells" : "light",
		"player1key" : "dark",
		"player2key" : "light"
	},
	
	//Constructor
	_create: function () {
	    this.element.css({
	        "width": this.options.size + "px",
	        "height": this.options.size + "px",
	        "border": "0px solid black"
	    });
        //añadir un nombre de clase para facilitar la posterior búsqueda de este objeto.
		this.element.addClass("ui-checkersGame");
		this.element.append(this.Player1div = $("<DIV>"));
		this.element.append(this.MainDiv = $("<DIV>")
			.css({
				"width": this.options.size + "px",
				"height": this.options.size + "px",
				"border": "1px solid black"})
		);
		this.element.append(this.Player2div = $("<DIV>"));
		this.element.append(this.InfoDiv = $("<DIV>"));
		this.element.append(this.CapturedDiv = $("<DIV>"));
		
		this.Player1div.append($("<P>").css({ "text-align": "center" }).text(this.options.player1.name));
		this.Player2div.append($("<P>").css({ "text-align": "center" }).text(this.options.player2.name));

		this.InfoDiv.append($("<SPAN>").text("Juega: "), $("<IMG>").prop({ "src": "img/blue.svg" }).css({
		    "width":  "12px",
		    "height": "12px"
		}));
	},
	
	//Inicializador
	_init() {
		//Para lograr referenciar a este widget dentro de funciones que le dan otro sentido a la palabra clave "this"
		var thisWidget = this;
		var cellsize = (this.options.size / 8) - (2 * this.options.cellBorder);
		this.lastCapure = null;

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
							"type": (light ? thisWidget._myInternalKeys.lightCells : thisWidget._myInternalKeys.darkCells),
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
					"start": boardUtils.startDrag,
					"zIndex": 100 })
				.data({
					"type": (i<12)? thisWidget._myInternalKeys.player1key : thisWidget._myInternalKeys.player2key,
					"isKing": false });
			this.checkers.push(checker);
			
			var desde = (checker.data("type") == thisWidget._myInternalKeys.player1key) ? 0 : 5,
			      cell = boardUtils.getBlackDivs(desde,desde+3,false,thisWidget)[0];
			
			boardUtils.insertCheckerIntoCell(checker, cell);
		}
		
		thisWidget.CurrentPlayer = thisWidget._myInternalKeys.player1key;	
	},
	
});