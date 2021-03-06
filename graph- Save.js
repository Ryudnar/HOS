var width = 1280,
    height = 1024,
    global;

var force = d3.layout.force()
    .linkDistance(100)
    .charge(-1000)
    .gravity(0)
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

global = JSON.parse(localStorage.getItem('graph'));

reload();
/* d3.json(graph, function(error, json) {
  if (error) throw error;

  global = json;
  update();
}); */


function reload() {
    global = JSON.parse(localStorage.getItem('graph'));
    update();
}

function update() {
  var nodes = flatten(global),
      links = d3.layout.tree().links(nodes);

  var root = nodes[nodes.length-1];
  root.x = width/2;
  root.y = height/2;
  root.fixed = true;
  
  // Restart the force layout.
  force
      .nodes(nodes)
      .links(links)
      .start();
  
  // Update links.
  link = link.data(links, function(d) { return d.target.id; });

  link.exit().remove();

  link.enter().insert("line", ".node")
      .attr("class", "link");

  // Update nodes.
  node = node.data(nodes, function(d) { return d.id; });

  node.exit().remove();

  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .on("click", click)
      .call(force.drag);
	  
  nodeEnter.append("circle")
      .attr("r", function(d) {
		  var radius = 0;
		  function accum(n) {
			  radius += n.size;
		  }
		  if (d.children) d.children.forEach(accum);
		  if (!(Math.sqrt(d.size) / 5)) {
			  d.size = radius;
		  }
		  return Math.sqrt(d.size) / 5 || 65;
		  });

  nodeEnter.append("text")
      .attr("dy", ".35em")
      .text(function(d) { return d.process; });

  node.select("circle")
      .style("fill", color);
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function color(d) {
  return d._children ? "#BBBBBB" // collapsed package
      : d.children ? "#FFFFFF" // expanded package
      : "#fd8d3c"; // leaf node
}

// Toggle children on click.
function click(d) {
  if (d3.event.defaultPrevented) return; // ignore drag
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }

  reload();
}

// Returns a list of all nodes under the global.
function flatten(global) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(global);
  return nodes;
}
