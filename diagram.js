
var input;

document.getElementById('formButton').addEventListener('click', function(){
  input = document.getElementById('textInput').value;
  return input;
})


//--------------- 
//Class Constructors


//container node constructor
var idCounter = 0;

var ContainerNode = function() {
  this.connectedTo = [];
  this.connectedFrom = [];
  this.content = [];
  this.x = 400;
  this.y = 500;
  this.id = idCounter;
  idCounter++;
}
ContainerNode.prototype.constructor = ContainerNode;
ContainerNode.prototype.expand = function() {};
ContainerNode.prototype.contract = function() {};

//text content node
var TextNode = function(text) {
  ContainerNode.call(this);
  this.text = text;
}
TextNode.prototype.constructor = TextNode;
TextNode.prototype = Object.create(ContainerNode.prototype);

//image content node
var ImageNode = function(imageURL) {
  ContainerNode.call(this);
  this.imageURL = imageURL;
}
ImageNode.prototype.constructor = ImageNode;
ImageNode.prototype = Object.create(ContainerNode.prototype);

// var textToRender;
// function setText = function() {
//   console.log('input:', )
//   textToRender = 
// }



//not sure we need D3 shapes persay (can use html divs)
// rect = rect.data(dataNodes, function(d) { return d.id; });

//container div containing content div's and new content div (with buttons for text --> form or image --> url) [content choose div could be to left of ]
//perhaps click on container div triggers mousedown in D3

//-------------------
//D3 portion

//set up svg canvas
var width = 1500;
var height = 2000;
var colors = d3.scale.category10();

var svg = d3.select('.diagram')
  .append('svg')
  .attr({
    width: width,
    height: height,
  })
  // .on('mouseover', function(){
  //   this.
  // })

//array of container nodes to use as D3 data
// var textNode = new TextNode('textNode');
// var textNode1 = new TextNode('textNode1');
// var textNode2 = new TextNode('textNode2');
// var imageNode = new ImageNode('http://www.ibiblio.org/wm/paint/auth/kandinsky/kandinsky.comp-8.jpg');

var dataNodes = [],
  lastNodeId = 0;




// var force = d3.layout.force()
//     .nodes(dataNodes)
//     .links(links)
//     .size([width, height])
//     // .linkDistance(150)
//     // .linkStrength(300)
//     // .charge(-500)
//     .on('tick', tick)

// function tick() {
//   link.attr("x1", function(d) { return d.source.x; })
//       .attr("y1", function(d) { return d.source.y; })
//       .attr("x2", function(d) { return d.target.x; })
//       .attr("y2", function(d) { return d.target.y; });

//   container.attr("cx", function(d) { return d.x; })
//       .attr("cy", function(d) { return d.y; });

//   console.log(container.attr)
// }


// svg.append('svg:defs').append('svg:marker')
//   .attr({
//     id: 'end-arrow',
//     viewBox: '0 -5 10 10',
//     refX: 6,
//     markerWidth: 2,
//     markerHeight: 2,
//     orient: 'auto'
//   })
//   .append('svg:path')
//     .attr({
//     d: 'M0,-5L10,0L0,5',
//     fill: '#000'})

// svg.append('svg:defs').append('svg:marker')
//   .attr({
//     id: 'start-arrow',
//     viewBox: '0 -5 10 10',
//     refX: 4,
//     markerWidth: 2,
//     markerHeight: 2,
//     orient: 'auto'
//   })
//   .append('svg:path')
//     .attr({
//     d: 'M0,-5L10,0L0,5',
//     fill: '#000'})

var dragLine = svg.append('svg:path')
  .attr({
    class: 'link dragline hidden',
    d: 'M0,0L0,0'
  });

var path = svg.append('svg:g').selectAll('path'),
    container = svg.append('svg:g').selectAll('g');

var links = [];

var selectedNode = null,
    selectedTarget = null,
    mousedownTarget = null,
    mousedownNode = null,
    mouseupNode = null;

function resetMouseVars () {
    mousedownTarget = null;
    mousedownNode = null;
    mouseupNode = null;
}

function render() {
    path = path.data(links);

    path.enter().append('svg:path')
      .attr('class', 'link')

      .on('mousedown', function(d) {

        mousedownTarget = d;
          if (mousedownTarget === selectedTarget) {
            selectedTarget = null;
          }
          else {
            selectedTarget = mousedownTarget;
          }
        selectedNode = null;
        render();
          
      });

    var link = svg.selectAll("line.link")
      .data(links)
      .enter().append("svg:line")
      .attr("class", "line.link")
      // .style('z-index', 0)
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .attr('class', 'container:' + function(d) {
        return d.id;
      })
      .style({
        stroke: 'gray',
        // stroke-dasharray: '10, 2'
        'stroke-dasharray': 20,
        // 'z-index': 0
      })
      // .attr("marker-end", "url(#arrowGray)")

    container = container.data(dataNodes);

    container.selectAll('g');

    // add new nodes
    var g = container.enter().append('rect')
      .attr({
        class: 'container',
        // 'class':'container:' + function(d){
        //   return d.id;
        // }, 
        'z-index': 2,
        height: 80,
        width: 160,
        x: function(d){
          return d.x;
        },
        y: function(d) {
          return d.y;
        }
      })
      .style('fill', function(d) { 
        return colors(d.id);
      })
      .style('stroke', 'black')

      .on('mousedown', function(d) {
        // if (!d3.event.shiftKey) {
        //   d3.select(this).on('.drag', null)
        // }

        mousedownNode = d;
        if(mousedownNode === selectedNode) {
          selectedNode = null;
        }
        else {
          selectedNode = mousedownNode;
        }
        selectedTarget = null;
        
        // reposition drag line
        dragLine
          .style('marker-end', 'url(#end-arrow)')
          .classed('hidden', false)
          .attr('d', 'M' + mousedownNode.x + ',' + mousedownNode.y + 'L' + mousedownNode.x + ',' + mousedownNode.y);

        render();
      })
      .on('mouseup', function(d) {
        if (!mousedownNode) {
          return;
        }

        // needed by FF
        dragLine
          .classed('hidden', true)
          .style('marker-end', '');

        // check for drag-to-self
        mouseupNode = d;
        if (mouseupNode === mousedownNode) { 
          resetMouseVars(); 
          return; 
        }

        selectedTarget = mouseupNode;
        
        var linkObj = {
          source: mousedownNode,
          target: mouseupNode
        }

        selectedNode = null;
        links.push(linkObj);
        render();
      })
      // .call(drag)

      // svg.selectAll('g').call(drag)
     
  var text = svg.selectAll('text').data(dataNodes)
      .enter().append('text')
      .attr('class','container' + function(d){
        return d.id;
      })
      .text(function(d){
        return d.text;
      })
      .attr({ 
        'x': function(d, i) {
          return d.x + 10;
        },
        'y': function(d) {
          return d.y + 20;
        }
      })

    
    
      // var image = svg.selectAll('image').data(dataNodes)
    //   .enter().append('svg:image')
    //   .attr({
    //     x: function (d) {
    //       return d.x - 20;
    //     },
    //     y: function (d) {
    //       return d.y;
    //     },
    //     height: 160,
    //     width: 220,
    //     'xlink:href': function(d) {
    //       return d.imageURL;
    //     }
    //   })
  }

function mousedown() {
  // prevent I-bar on drag
  d3.event.preventDefault();
  if (mousedownNode) {
    return;
  }

  // insert new node at point
  var mouseCoord = d3.mouse(this)
  // if (document.getElementById('contentSelector').value === 'text') {
  //   node = new TextNode(input); 
  // } else if (document.getElementById('contentSelector').value === 'image') {
  //   node = new ImageNode(input);
  // }
  var node = new TextNode(input);
      
  node.x = mouseCoord[0];
  node.y = mouseCoord[1];
  dataNodes.push(node);

  render();
}

function mousemove() {
  if (!mousedownNode) {
    return;
  }

  // update drag line
  dragLine.attr('d', 'M' + mousedownNode.x + ',' + mousedownNode.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

  render();
}

function mouseup() {
  if(mousedownNode) {
    // hide drag line
    dragLine
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // clear mouse event vars
  resetMouseVars();
}

var drag = d3.behavior.drag()
  .on('dragstart', function(){

    d3.select(this)
      .style('opacity', 0.6);
  })
  .on('drag', function() {
      //need a select all in container
      d3.select(this)
        .attr({
          x: d3.event.x,
          y: d3.event.y
      })
  })
  .on('dragend', function(){
    d3.select(this)
      .style('opacity', 1)
    // d3.select(this).on('.drag', null)
    // render();
  })




//to remove the node
// function spliceLinksForNode(node) {
//   var toSplice = links.filter(function(l) {
//     return (l.source === node || l.target === node);
//   });
//   toSplice.map(function(l) {
//     links.splice(links.indexOf(l), 1);
//   });
// }

svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup)
  // .on('keydown', keydown)
  // .on('mouseover', mouseover)
// d3.select(window)
//   .on('keydown', keydown)
//   .on('keyup', keyup);
render();

//------------------
//jQuery














































