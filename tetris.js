/*global angular*/

(function(){
	'use strict';
	var createArray = function(y, x){
			var yArray = [],
				xArray,
				xCopy = x;
			
			while(y--){
				xArray = [];
				yArray.push(xArray);
				while(x--){
					xArray.push('0');
				}
				x = xCopy;
			}
			
			return yArray;
		},
		forEachEach = function(array, callback){
			angular.forEach(array, function(y, yIndex){
				angular.forEach(y, function(x, xIndex){
					callback(x, yIndex, xIndex, array);
				});
			});
		};
	
	angular.module('tetris', [])
	.directive('tetris', [function(){
		var cellWidth,
			definition = {
			restrict: 'EA',
			scope: {
				pieces: '@'
			},
			template: [
				'<div class="tetris">',
					'<div class="tetrisPlayingField" ng-style="{\'padding-right\': widthOffset+\'px\'}">',
						'<div class="tetrisBoard">',
							'<div class="tetrisRow" ng-repeat="row in boardSize">',
								'<div class="tetrisCell tetrisShape_{{cell}}" ng-repeat="cell in row track by $index">',
									'<div class="testrisBorder"></div>',
								'</div>',
							'</div>',
						'</div>',
						'<div tetris-piece="" left="{{activePiece.left}}" top="{{activePiece.top}}" shape-size="activePiece.shapeSize" size="{{activePiece.size}}">',			
						'</div>',
					'</div>',
					'<div class="tetrisStatus">',
						'<div ng-show="gameOver">Game Over</div>',
						'<div ng-show="paused">Paused</div>',
						'<div>Level: {{getLevel()}}</div>',
						'<div>Score: {{score | number}}</div>',
						'<div class="tetrisNextPiece">',
							'<div tetris-piece="" shape="{{nextPiece.shape}}" shape-size="nextPiece.shapeSize" size="{{activePiece.size}}"></div>',
						'</div>',
					'</div>',
				'</div>'
			].join(''),
			controller: ['$scope','tetrisPieces','$interval','tetrisLevel', '$window',
				function($scope, tetrisPieces, $interval, tetrisLevel, $window){
					var updatePromise,
						clearCompletRows = function(){
							var completeRows = [],
								isComplete = false,
								maxSize = $scope.boardSize[0].length;
							
							forEachEach($scope.boardSize, function(value, y, x, boardSize){
								if(x === 0){
									isComplete = true;
								}
								isComplete = isComplete && boardSize[y][x] !== '0';
								if(x === maxSize-1 && isComplete){
									completeRows.push(y);
								}
							});
							
							angular.forEach(completeRows, function(value){
								var newRow = createArray(1, maxSize);
								
								$scope.score += 1000000;
								tetrisLevel.increase();
								$scope.boardSize.splice(value, 1);
								$scope.boardSize = newRow.concat($scope.boardSize);
							});
						},
						putPieceOnBoard = function(piece){
							var left = piece.left,
								top = piece.top;
							
							forEachEach(piece.shapeSize, function(shape, yIndex, xIndex){
								if(shape !== '0')
								{
									$scope.boardSize[top + yIndex][left + xIndex] = shape;
								}
							});
							
						},
						isCollision = function(piece, x, y){
							var collision = false,
								left = piece.left,
								top = piece.top;
							
							forEachEach(piece.shapeSize, function(shape, yIndex, xIndex){
								var row;
								
								if(shape !== '0'){
									row = $scope.boardSize[top + yIndex + y];
									collision = collision || !row || row[left + xIndex + x] !== '0';
								}
							});
							return collision;
						},
						go = function(){
							updatePromise = $interval(update, tetrisLevel.pieceRate);
						},
						startNextPiece = function(){
							$scope.activePiece = $scope.nextPiece;
							$scope.nextPiece = tetrisPieces.createPiece(cellWidth, $scope.pieces);
						},
						update = function(){
							if(isCollision($scope.activePiece, 0, 1))
							{
								putPieceOnBoard($scope.activePiece);
								clearCompletRows();
								startNextPiece();
								if(isCollision($scope.activePiece, 0, 0)){
									$scope.activePiece.top--;
									$interval.cancel(updatePromise);
									$scope.gameOver = true;
								}
							}
							else
							{
								$scope.score++;
								$scope.activePiece.top++;
							}
						};
					
					angular.element(window).on('keydown', function(event){
						var rotatedPiece;
						
						if(event.keyCode === 32){
							if($scope.paused){
								go();
							}
							else{
								$interval.cancel(updatePromise);
							}
							$scope.paused = !$scope.paused;
							$scope.$apply();
						}
						else if(!$scope.paused && !$scope.gameOver){
							if(event.keyIdentifier === 'Left' && !isCollision($scope.activePiece, -1, 0)){
								$scope.activePiece.left--;
								$scope.$apply();
							}
							else if(event.keyIdentifier === 'Right' && !isCollision($scope.activePiece, 1, 0)){
								$scope.activePiece.left++;
								$scope.$apply();
							}
							else if(event.keyIdentifier === 'Down' && !isCollision($scope.activePiece, 0, 1)){
								$scope.activePiece.top++;
								$scope.score++;
								$scope.$apply();
							}
							else if(event.keyIdentifier === 'Up' && !isCollision(rotatedPiece = $scope.activePiece.getRotation(), 0, 0)){
								$scope.activePiece = rotatedPiece;
								$scope.$apply();
							}	
						}
					});
					$scope.$on('destroy', function(){
						angular.element(window).off('keydown.tetrisKeys');
					});
					$scope.boardSize = createArray(20, 10);//10x20 is tied to CSS
					$scope.score = 0;
					$scope.getLevel = function(){
						return Math.floor(tetrisLevel.level);
					};
					$scope.nextPiece = tetrisPieces.createPiece(cellWidth, $scope.pieces);
					startNextPiece();
					go();
				}],
				link: function(scope, element){
					scope.$watch(function(){
						return element[0].offsetWidth;
					},
					function(newWidth){
						var fieldWidth = newWidth * 0.75,
							widthOffset = fieldWidth % 10;
						
						cellWidth = Math.floor(fieldWidth / 10);
						
						//board is 75% of the directive, a cell is 10% of that
						scope.nextPiece.size = cellWidth;
						scope.activePiece.size = cellWidth;
						scope.widthOffset = widthOffset;
					});
				}
			};
		
		return definition;
	}])
	.factory('tetrisPieces', [function(){
		var defaultPieces = [
				[
					['o','o'],
					['o','o']
				],
				[
					['0','i','0'],
					['0','i','0'],
					['0','i','0'],
					['0','i','0']
				],
				[
					['l','0'],
					['l','0'],
					['l','l']
				],
				[
					['0','j'],
					['0','j'],
					['j','j']
				],
				[
					['0','t','0'],
					['t','t','t']
				],
				[
					['z','z','0'],
					['0','z','z']
				],
				[
					['0','s','s'],
					['s','s','0']
				]
			],
			definition = {
				createPiece: function(size, customPieces){
					var pieces = customPieces ? angular.fromJson(customPieces) : defaultPieces,
						random = Math.random(),
						pieceIndex = Math.floor(random*pieces.length),
						piece = pieces[pieceIndex];
					
					return {
						size: size,
						shapeSize: piece,
						top: 0,
						left: 4,
						getRotation: function(){
							var rotatedShape = [];
							
							forEachEach(this.shapeSize, function(value, y, x){
								if(y === 0){
									rotatedShape.push([]);
								}
								rotatedShape[x].unshift(value);
							});
							
							return {
								size: this.size,
								shapeSize: rotatedShape,
								top: this.top,
								left: this.left + rotatedShape.length - rotatedShape[0].length,
								getRotation: this.getRotation
							};
						}
					};
				}
		};
		
		return definition;
	}])
	.directive('tetrisPiece', [function(){
		var definition = {
			restrict: 'A',
			scope: {
				size: '@',
				left: '@',
				top: '@',
				shapeSize: '&'
			},
			replace: true,
			template: [
				'<div class="tetrisActivePiece" ng-style="{left: getLeft(), top: getTop()}">',
					'<div class="tetrisRow" ng-repeat="row in shapeSize()">',
							'<div ng-style="{\'width\': size+\'px\', \'height\': size+\'px\'}" class="tetrisCell tetrisShape_{{cell}}" ng-repeat="cell in row track by $index">',
								'<div class="testrisBorder"></div>',
							'</div>',
						'</div>',
				'</div>'
			].join(''),
			controller: ['$scope', function($scope){
				$scope.getTop = function(){
					return $scope.size * $scope.top + 'px';
				};
				$scope.getLeft = function(){
					return $scope.size * $scope.left + 'px';
				};
			}]
		};
		
		
		return definition;
	}])
	.factory('tetrisLevel', [function(){
		var startSpeed = 800,
			definition = {
			level: 1,
			pieceRate: startSpeed,
			increase: function(){
				var speed;
				
				this.level += 0.1;
				speed = startSpeed - (Math.floor(this.level) - 1)*50;
				this.pieceRate = speed > 50 ? speed : 50;
			}
		};
		
		return definition;
	}]);
}());
