(function($){

	function myGame(element, size) {
		this.gameObject = element.attr("id");
		this.numberCellInRow = 4;
		this.blockSize = size;
		this.boardSize = this.numberCellInRow * this.blockSize + 15 + 20;
		this.cells = [];

		for (var x = 1 ; x <= this.numberCellInRow ; x++) {
			this.cells[x] = [];
			for (var y = 1 ; y <= this.numberCellInRow ; y++) {
				this.cells[x][y] = null;
			}
		}

		this.init();
	}

	myGame.prototype = {

		init: function() {
			var self = this;

			$("body").css({"width": this.boardSize});

			//Gestion du bouton "restart"
			$(".restart").click(function() {
				self.restart();
			});

			//Gestion des flèches directionnelles
			$(document).keydown(function(event) {
				event.preventDefault();
			    switch(event.which) {
			      case 37: self.leftKeydown();
			      break;

			      case 38: self.upKeydown();
			      break;

			      case 39: self.rightKeydown();
			      break;

			      case 40: self.downKeydown();
			      break;

			      default: return;
			    }
			});

			this.setup();
		},

		/**********************************************************************
		Role : insertion des éléments de la grille de jeu et des deux premières
		tuiles
		**********************************************************************/
		setup: function() {
			var i = 0;
			var j = 0;

			//Ajout du contenant principal
			if (this.gameObject == undefined)
				$(".grid-container").append("<div id='board'></div>");
			else
				$("#" + this.gameObject).append("<div id='board'></div>");

			$("#board").css({"height": this.boardSize, "width": this.boardSize});

			//Ajout des lignes
			while (i < this.numberCellInRow) {
				$("#board").append("<div class='row-container'></div>");
				i++;
			}

			//Ajout des cellules dans chaque ligne
			while (j < this.numberCellInRow) {
				$(".row-container").append("<div class='cell-container'></div>");
				j++;
			}

			$(".row-container").css({"height": this.blockSize, "margin-bottom": 5});
			$(".cell-container").css({"height": this.blockSize, "width": this.blockSize});

			this.addTile(2);
		},

		/***********************************
		Role : remet le jeu à l'état initial
		***********************************/
		restart: function() {
			$(".cell-container > div").remove();
			for (var x = 1 ; x <= this.numberCellInRow ; x++) {
				this.cells[x] = [];
				for (var y = 1 ; y <= this.numberCellInRow ; y++) {
					this.cells[x][y] = null;
				}
			}

			this.score(0);
			this.addTile(2);
		},

		/**************************************************************
		Role : ajout aléatoire d'une tuile dans le tableau des cellules
		**************************************************************/
		addTile: function(number) {
			var numberTile = number ? number : 1

			for (var i = 0 ; i < numberTile ; i++) {
				if (this.cellsAvailable().length != 0) {
					var value = Math.floor((Math.random() * 2) + 1) * 2;
					var tile = this.cellRandom();
					tile.value = value;
					this.cells[tile.x][tile.y] = tile;

					this.insertTile(tile.x, tile.y , tile.value);
				} else {
					alert("Game over");
					this.restart();
				}
			}
		},

		/******************************************
		Role : insertion d'une tuile dans la grille
		******************************************/
		insertTile: function(x, y, value) {
			$(".row-container:nth-child(" + x + ") .cell-container:nth-child(" + y + ")").append("<div class='cell cell" + value + "'></div>");
			$(".row-container:nth-child(" + x + ") .cell-container:nth-child(" + y + ") > div").text(value).css({"line-height": this.blockSize + "px"});
		},

		/******************************************
		Role : récupère une cellule aléatoire libre
		******************************************/
		cellRandom: function() {
			var cell = this.cellsAvailable();

			if (cell.length)
				return cell[Math.floor(Math.random() * cell.length)];
		},

		/**************************************
		Role : liste toutes les cellules libres
		**************************************/
		cellsAvailable: function() {
			var cell = [];

			for (var x = 1 ; x <= 4 ; x++) {
				for (var y = 1 ; y <= this.numberCellInRow ; y++) {
					if (this.cells[x][y] == null)
						cell.push({x: x, y: y, value: 0});
				}
			}
			return cell;
		},

		leftKeydown: function() {
			this.moveRow("left", 1);
			this.moveRow("left", 2);
			this.moveRow("left", 3);
			this.moveRow("left", 4);
			this.addTile(1);
		},

		upKeydown: function() {
			this.moveColumn("up", 1);
			this.moveColumn("up", 2);
			this.moveColumn("up", 3);
			this.moveColumn("up", 4);
			this.addTile(1);
		},

		rightKeydown: function() {
			this.moveRow("right", 1);
			this.moveRow("right", 2);
			this.moveRow("right", 3);
			this.moveRow("right", 4);
			this.addTile(1);
		},

		downKeydown: function() {
			this.moveColumn("down", 1);
			this.moveColumn("down", 2);
			this.moveColumn("down", 3);
			this.moveColumn("down", 4);
			this.addTile(1);
		},

		/*************************************
		Role : gère les mouvements horizontaux
		*************************************/
		moveRow: function(direction, row) {
			if (direction == "left") {
				for (var i = 2 ; i <= 4 ; i++) {
					//Si la cellule juste à côté est libre alors la tuile va y être déplacée
					if ((this.cells[row][i] != null) && (this.cells[row][i - 1] == null)) {
						//La tuile est déplacée dans la cellule juste à côté
						this.cells[row][i - 1] = this.cells[row][i];
						this.cells[row][i] = null;
						this.cells[row][i - 1].x = row;
						this.cells[row][i - 1].y = i - 1;

						this.insertTile(row, i - 1, this.cells[row][i - 1].value);

						$(".row-container:nth-child(" + row + ") .cell-container:nth-child(" + i + ") > div").remove();

						//La récursivité permet de traiter les tuiles une par une
						this.moveRow("left", row);
						//Si la cellule juste à côté est occupée par une tuile de même valeur alors elles fusionnent
					} else if ((this.cells[row][i] != null) && (this.cells[row][i - 1].value == this.cells[row][i].value))
						this.merge("left", row, i);
				}
			} else if (direction == "right") {
				for (var i = 3 ; i >= 1 ; i--) {
					if ((this.cells[row][i] != null) && (this.cells[row][i + 1] == null)) {
						this.cells[row][i + 1] = this.cells[row][i];
						this.cells[row][i] = null;
						this.cells[row][i + 1].x = row;
						this.cells[row][i + 1].y = i + 1;

						this.insertTile(row, i + 1, this.cells[row][i + 1].value);

						$(".row-container:nth-child(" + row + ") .cell-container:nth-child(" + i + ") > div").remove();

						this.moveRow("right", row);
					} else if ((this.cells[row][i] != null) && (this.cells[row][i + 1].value == this.cells[row][i].value))
						this.merge("right", row, i);
				}
			}
		},

		/***********************************
		Role : gère les mouvements verticaux
		***********************************/
		moveColumn: function(direction, column) {
			if (direction == "up") {
				for (var i = 2 ; i <= 4 ; i++) {
					if ((this.cells[i][column] != null) && (this.cells[i - 1][column] == null)) {
						this.cells[i - 1][column] = this.cells[i][column];
						this.cells[i][column] = null;
						this.cells[i - 1][column].x = i - 1;
						this.cells[i - 1][column].y = column;

						this.insertTile(i - 1, column, this.cells[i - 1][column].value);

						$(".row-container:nth-child(" + i + ") .cell-container:nth-child(" + column + ") > div").remove();

						this.moveColumn("up", column);
					} else if ((this.cells[i][column] != null) && (this.cells[i - 1][column].value == this.cells[i][column].value))
						this.merge("up", i, column);
				}
			} else if (direction == "down") {
				for (var i = 3 ; i >= 1 ; i--) {
					if ((this.cells[i][column] != null) && (this.cells[i + 1][column] == null)) {
						this.cells[i + 1][column] = this.cells[i][column];
						this.cells[i][column] = null;
						this.cells[i + 1][column].x = i + 1;
						this.cells[i + 1][column].y = column;

						this.insertTile(i + 1, column, this.cells[i + 1][column].value);

						$(".row-container:nth-child(" + i + ") .cell-container:nth-child(" + column + ") > div").remove();

						this.moveColumn("down", column);
					} else if ((this.cells[i][column] != null) && (this.cells[i + 1][column].value == this.cells[i][column].value))
						this.merge("down", i, column);
				}
			}
		},

		/*******************************
		Role : gère la fusion des tuiles
		*******************************/
		merge: function(direction, row, column) {
			if (direction == "left") {
				//La valeur de la tuile est multipliée par deux
				var value = this.cells[row][column - 1].value * 2;
				//L'emplacement de la tuile fusionnée est avant l'ancienne tuile
				var columnMerge = column - 1;

				//L'ancienne tuile est supprimée et la nouvelle est insérée
				$(".row-container:nth-child(" + row + ") .cell-container:nth-child(" + column + ") > div").remove();
				$(".row-container:nth-child(" + row + ") .cell-container:nth-child(" + columnMerge + ") > div").text(value).removeClass("cell" + this.cells[row][column - 1].value).addClass("cell" + value);

				//La valeur de la tuile fusionnée est insérée dans le tableau
				this.cells[row][column - 1].value = value;
				this.score(value);
				//La valeur de l'ancienne tuile est supprimée
				this.cells[row][column] = null;
			} else if (direction == "right") {
				var value = this.cells[row][column + 1].value * 2;
				var columnMerge = column + 1;

				$(".row-container:nth-child(" + row + ") .cell-container:nth-child(" + column + ") > div").remove();
				$(".row-container:nth-child(" + row + ") .cell-container:nth-child(" + columnMerge + ") > div").text(value).removeClass("cell" + this.cells[row][column + 1].value).addClass("cell" + value);

				this.cells[row][column + 1].value = value;
				this.score(value);
				this.cells[row][column] = null;
			} else if (direction == "up") {
				var value = this.cells[row - 1][column].value * 2;
				var rowMerge = row - 1;

				$(".row-container:nth-child(" + row + ") .cell-container:nth-child(" + column + ") > div").remove();
				$(".row-container:nth-child(" + rowMerge + ") .cell-container:nth-child(" + column + ") > div").text(value).removeClass("cell" + this.cells[row - 1][column].value).addClass("cell" + value);

				this.cells[row - 1][column].value = value;
				this.score(value);
				this.cells[row][column] = null;
			} else if (direction == "down") {
				var value = this.cells[row + 1][column].value * 2;
				var rowMerge = row + 1;

				$(".row-container:nth-child(" + row + ") .cell-container:nth-child(" + column + ") > div").remove();
				$(".row-container:nth-child(" + rowMerge + ") .cell-container:nth-child(" + column + ") > div").text(value).removeClass("cell" + this.cells[row + 1][column].value).addClass("cell" + value);

				this.cells[row + 1][column].value = value;
				this.score(value);
				this.cells[row][column] = null;
			}
		},

		score: function(value) {
			if (value != 0) {
				var oldValue = $(".score").text();
				var newValue = parseInt(oldValue) + parseInt(value);
				$(".score").text(newValue);
			} else {
				$(".score").text(0);
			}
		},
	};

	$.fn.mygame = function(size) {
		return new myGame(this, size);
	};

})(jQuery);
