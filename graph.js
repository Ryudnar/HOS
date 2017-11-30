var width = 1280,
    height = 1024,
    global = {
      "name": "My Computer",
      "children": []
    };

var force = d3.layout.force()
    .linkDistance(200)
    .charge(-100)
    .gravity(0)
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");
    
var connList = [];
var newNodes = [];
var prevNodes = [];

function updateJsonStr (callback) {
  global = {
    "process": "My Computer",
    "children": []
  };
  for (i in connList) {
    if(connList[i].process == "<invalid>") continue;
    var proc = global.children.filter(function( obj ) {
      return obj.process == connList[i].process
    });
    proc = proc[0];
    if(proc == null) {
      proc = {
        "process": connList[i].process,
        "children": []
      };
      global.children.push(proc);
      continue;
    }
    else {
      detail = {
        "process" : connList[i].process,
        "port" : connList[i].port,
        "ip" : connList[i].ip,
        "risk" : connList[i].risk
      };
      proc.children.push(detail);
    }
  }
  if(typeof callback === "function") {
      console.log("call update from updateJsonStr");
      callback();
  }
}

updateJsonStr(update);

function update() {
  var nodes = flatten(global),
      links = d3.layout.tree().links(nodes);

  var root = nodes[nodes.length-1];
  root.x = width/2;
  root.y = height/2;
  root.fixed = true;

  newNodes = nodes.filter(newNode => prevNodes.findIndex(obj => (obj.process == newNode.process && obj.port == newNode.port && obj.ip == newNode.ip && newNode.risk != -1) == -1));

  
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
	  
  nodeEnter.append("circle")
      .attr("r", function(d) {
		  var radius = 0;
		  function accum(n) {
			  radius += n.size*20;
		  }
		  if (d.children) d.children.forEach(accum);
          if(d.size < 0) {
            d.size = 1;
          }
		  return 40;
		  });

  nodeEnter.append("text")
      .attr("dy", ".35em")
      .text(function(d) { return d.children ? d.process : d.risk; });

  nodeEnter.filter(i => !i.fixed)
    .call(force.drag);

  nodeEnter.select("circle")
      .style("fill", color);


    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .start();

    prevNodes = nodes;
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
      : d.risk === -1 ? "#fd8d3c"
      : d.risk === 0 ? "#50bcdf"
      : "#dc143c"; // leaf node
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
  update();
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
