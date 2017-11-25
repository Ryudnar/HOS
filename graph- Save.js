var width = 1280,
    height = 1024,
    global = {
      "name": "My Computer",
      "children": []
    };

var force = d3.layout.force()
    .linkDistance(50)
    .charge(-50)
    .gravity(0)
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");
    
var connList = [];

function updateJsonStr () {
  global = {
    "name": "My Computer",
    "children": []
  };
  for (i in connList) {
    if(connList[i].name == "<invalid>") continue;
    var proc = global.children.filter(function( obj ) {
      return obj.name == connList[i].process
    });
    proc = proc[0];
    if(proc == null) {
      proc = {
        "name": connList[i].process,
        "children": []
      };
      global.children.push(proc);
      continue;
    }
    var port = proc.children.filter(function( obj ) {
      return obj.name == connList[i].port
    });
    port = port[0];
    if(port == null){
      port = {
        "name": connList[i].port,
        "children": []
      };
      proc.children.push(port);
      continue;
    }
    var ip = port.children.filter(function( obj ) {
      return obj.name == connList[i].ip
    });
    ip = ip[0];
    if(ip == null){
      ip = {
        "name": connList[i].ip,
        "children": []
      };
      var risk = {
        "name": parseInt(connList[i].risk),
        "size": 1
      };
      ip.children.push(risk);
      port.children.push(ip);
    }
  }
  update();
}

updateJsonStr();

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
      //.call(force.drag);
	  
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
		  return 20;
		  });

  nodeEnter.append("text")
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

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
