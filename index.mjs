console.clear();
const xlinkNS = 'http://www.w3.org/1999/xlink';
const svgNS = 'http://www.w3.org/2000/svg';

function attr(element, attrs) {
  Object.keys(attrs).forEach(key => {
    if (key.slice(0, 6) === 'xlink:') {
      element.setAttributeNS(xlinkNS, key.slice(6), attrs[key]);
      return;
    }
    element.setAttribute(key, attrs[key]);
  });
}

function createSprite(href, x, y, width = 64, height = 64) {
  const useElement = document.createElementNS(svgNS, "use");
  attr(useElement, { 'xlink:href': href, x, y, width, height });
  return useElement;
}

function getSprite(x, y) {
  return document.querySelector(`use[x="${x * 64}"][y="${y * 64}"]`);
}

function createMap(asciiMap) {
  return asciiMap.map(line => line.split('')) || [];
}

class Snake {


  constructor(world) {
    this.world = world || document.querySelector('#world');
    this.spriteMap = {
      ' ': '#blank',
      '#': '#wall',
      '.': '#cookie'
    };
    this.level = createMap([
      "###################",
      "#.. ... . . .... .#",
      "#. #. .#. .#. .# .#",
      "#.  . . . . . . ..#",
      "#..#...#...#...#..#",
      "#.      .x.      .#",
      "#..#...#...#...#..#",
      "#.. . . . . . . ..#",
      "#. #. .#. .#. .# .#",
      "#.  ... . . .... .#",
      "###################"
    ]);
    if (this.level.length === 0 || this.level[0].length === 0) {
      throw new Error('no level loaded.');
    }
    this.yDim = this.level.length;
    this.xDim = this.level[0].length;
    this.gameOver = false;
    this.player = {
      head: null,
      tail: null,
      x: 0,
      y: 0,
      tailCoords: []
    }
  }

  getField(x, y) {
    return this.level[y][x] || '#'
  }

  setField(x, y, value) {
    this.level[y][x] = value;
  }


  setup() {
    this.initialRender();
    this.setupKeys();
  }

  move(xr, yr) {
    if (this.gameOver || (xr !== 0 && yr !== 0)) {
      return false;
    }
    const { x, y } = this.player;
    const field = this.getField(x + xr, y + yr);
    if (field === '#') {
      return false;
    }
    this.player.tailCoords.unshift({x, y});
    if (field === '.' ) {
      this.setField(x + xr, y + yr, ' ');
    }
    if (field === ' ') {
      this.player.tailCoords.pop();
    }
    this.player.x = x + xr;
    this.player.y = y + yr;
    this.update();
    this.checkCollisions();
  }

  checkCollisions() {
    console.time();
    const coords = [{x: this.player.x, y: this.player.y}].concat(this.player.tailCoords);
    coords.forEach(a => {
      const nodes = coords.filter(b => a.x === b.x && a.y === b.y);
      if (nodes.length > 1) {
        this.gameOver = true;
        return true;
      }
    });
    console.timeEnd();
    return false;
  }


  moveUp() {
    this.move(0, -1);
  }

  moveDown() {
    this.move(0, 1);
  }

  moveLeft() {
    this.move(-1, 0);
  }

  moveRight() {
    this.move(1, 0);
  }

  initialRender() {
    this.world.childNodes.forEach(node => node.remove());
    this.level.forEach((line, y) => {
      line.forEach((col, x) => {
        if (col === 'x') {
          col = ' ';
          this.player.x = x;
          this.player.y = y;
          this.setField(x,y, ' ');
        }
        const sprite = createSprite(this.spriteMap[col], x * 64, y * 64);
        this.world.appendChild(sprite);
        

      });
    });
    this.player.head = createSprite('#snakeHead', this.player.x * 64, this.player.y * 64);
    this.player.tail = document.createElementNS(svgNS, 'path');
    attr(this.player.tail, {
      'class': 'snake__tail',
    });
    this.world.appendChild(this.player.tail);
    this.world.appendChild(this.player.head);
  }

  setupKeys() {
    window.addEventListener('keyup', (e) => {
      console.log(e.keyCode);

      if (e.keyCode === 38) {
        this.moveUp();
      }
      if (e.keyCode === 40) {
        this.moveDown();
      }
      if (e.keyCode === 37) {
        this.moveLeft();
      }
      if (e.keyCode === 39) {
        this.moveRight();
      }
    });
  }


  update() {
    for (let y = 0; y < this.yDim; y++) {
      for (let x = 0; x < this.xDim; x++) {
        const field = this.getField(x, y);
        const sprite = getSprite(x, y);
        attr(sprite, {
          'xlink:href': this.spriteMap[field]
        });
      }
    }
    attr(this.player.head, { 'x': this.player.x * 64, 'y': this.player.y * 64});
    const svgTailCoords = (x, y) => `${32 + x * 64}, ${32 + y * 64}`
    
    attr(this.player.tail, { 
      d: `M${svgTailCoords(this.player.x, this.player.y)} L` +
         this.player.tailCoords.map(({x , y}) => svgTailCoords(x, y)).join(' L') 
    });
  }

}

const game = new Snake();
game.setup();