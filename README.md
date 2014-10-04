A Tetris game built in angular as a directive to easily be added to any page.
The pieces are controlled by the up, down, left, and right keys and can be paused with the space bar.

```html
<!DOCTYPE html>
<head>
	<link href="https://raw.githubusercontent.com/IllustOne/tetris/master/tetris.css" type="text/css" rel="stylesheet"/>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular.min.js"></script>
	<script src="https://raw.githubusercontent.com/IllustOne/tetris/master/tetris.js"></script>
</head>
<body ng-app="tetris">
	<div tetris=""></div>
</body>
```

It is built to respond to it's container's size.

It also has an attribute to allow for custom pieces to be added to the game as an array of pieces, where a piece is a double array to define the size and color of the piece.  The colors are defined by a-z and a 0 denotes an empty space.

```html
<div tetris="" pieces='[
  [
    ["a","0","a"],
    ["a","a","a"]
  ],
    ["b","0","b"],
    ["0","b","0"]
  ],
  [
    ["0","c","0","c","0"]
    ["c","c","c","c","c"]
  ]
]'></div>
```

Although it is likely the custom pieces will not be as much fun as the time tested classic kind.
