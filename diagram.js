//create container node
  //add button
  //connectTo, connectFrom properties
  //draw arrow method (directed graph)
  //expand/contract method (.hidden class on connectTo children, .contracted & .expanded class for parent) [only works if children's connectFrom only has parent div and no others]

//d3 data: container node

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

//array of container nodes to use as D3 data
var textNode = new TextNode('textNode');
var textNode1 = new TextNode('textNode1');
var textNode2 = new TextNode('textNode2');

var dataNodes = [],
  lastNodeId = 0;

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

    path.classed('selected', function(d) { return d === selectedTarget; })
      .style('marker-start', function(d) { return d.source ? 'url(#start-arrow)' : ''; })
      .style('marker-end', function(d) { return d.target ? 'url(#end-arrow)' : ''; });

    path.enter().append('svg:path')
      .attr('class', 'link')
      .classed('selected', function(d) { return d === selectedTarget; })
      .style('marker-start', function(d) { return d.source ? 'url(#start-arrow)' : ''; })
      .style('marker-end', function(d) { return d.target ? 'url(#end-arrow)' : ''; })
      .on('mousedown', function(d) {
        if(d3.event.ctrlKey) {
          return;
        }

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
      .style('z-index', 0)
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .style({
        stroke: 'gray',
        // stroke-dasharray: '10, 2'
        'stroke-dasharray': 20,
        'z-index': 0
      })
      .attr("marker-end", "url(#arrowGray)")

    container = container.data(dataNodes);

    container.selectAll('rect');

    // add new nodes
    var g = container.enter().append('rect')
      .attr({
        class: 'container',
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
      .style('stroke', function(d) { 
        return colors(d.id);
      })

      .on('mousedown', function(d) {

        // select node
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

        // unenlarge target node
        d3.select(this).attr('transform', '');

        selectedTarget = mouseupNode;
        
        var linkObj = {
          source: mousedownNode,
          target: mouseupNode
        }

        selectedNode = null;
        links.push(linkObj);
        render();
      });

    var text = svg.selectAll('text').data(dataNodes) 
      .enter().append('text')
      .attr('class','percents') 
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

    // container.exit().remove();
  }

function mousedown() {
  // prevent I-bar on drag
  d3.event.preventDefault();
  if (mousedownNode) {
    return;
  }

  // insert new node at point
  var mouseCoord = d3.mouse(this),
      node = new TextNode("sample text");
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
  .on('mouseup', mouseup);
// d3.select(window)
//   .on('keydown', keydown)
//   .on('keyup', keyup);
render();













































