$.widget("custom.juegodedamas", {
		
	options: {
		player1: {name: "Jugador 1", color: "#FF0000"},
		player1: {name: "Jugador 2", color: "#0000FF"}
	},
	
	//Constructor
	_create: function () {
		
		//inicializar tablero.
		this.element.addClass("tablero");
		
		var lastRow;
		var lastCol;
		
		for (var r = 0; r < 8; r++) {
			var row = $("<DIV></DIV").addClass("row");
			this.element.append(row);
			
			if (lastRow) {
				row.position({
					my: "top",
					at: "bottom",
					of: lastRow,
					collision: "none"
				});
			} else {
				row.position({
					my: "left top",
					at: "left top",
					of: this.element,
					collision: "none"
				});
			}			
			
			lastCol = null;
			var piece;
			for (var c = 0; c < 8; c++) {
				var col = $("<DIV></DIV>").addClass("cell");
				if ((r % 2) == (c % 2))  {
					col.addClass("light");
				} else {
					col.addClass("dark");
					col.droppable();
					if (r<3) {
						piece = $("<img src='img/blue.svg' width='100px' height='100px'></img>").draggable();
						this.element.append(piece);
					}
					
					if (r>5) {
						piece = $("<img src='img/red.svg' width='100px' height='100px'></img>").draggable();
						this.element.append(piece);
					}
				}
				
				row.append(col);				
				
				if (lastCol) {
					col.position({
						my: "left top",
						at: "right top",
						of: lastCol,
					    collision: "none"
					});
				} else {
					col.position({
						my: "left top",
						at: "left top",
						of: row,
					    collision: "none"
					});
					
				}								
							
				$(piece).position({
					my: "center center",
					at: "center center",
					of: col					
				});	
				
				lastCol = col;
			}	

			lastRow = row;
		}
	}
	
}
);