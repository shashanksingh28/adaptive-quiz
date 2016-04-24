// treedata should have name and parent

function lerp(a, b, t) {
    var x = a + t * (b - a);
    return x;
}
function loadData(rawdata){
  console.log("inside loadData");


var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d-%b-%y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    formatValue = d3.format(",.2f"),
    formatCurrency = function(d) { return " "+ formatValue(d); };

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

var svg = d3.select("#linechart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

console.log("data");
console.log(rawdata);
data = [];
var i = 1;
for (var key in rawdata) {
      data.push({'date':i,'close':rawdata[key]})
      i += 1;
    //finalmean[key] = rawdata[key].mean/meandate[key].num;
  }
console.log(data);
/*  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.close = +d.close;
  });
*/
  /*data.sort(function(a, b) {
    return a.date - b.date;
  });*/
    x.domain([data[0].date, data[data.length - 1].date]);
  y.domain(d3.extent(data, function(d) { return d.close; }));
  
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Score");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

  var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
    focus.select("text").text(formatCurrency(d.close));
  }


}

function loadViz(data){
    
    console.log(data);
    
    // ************** Generate the tree diagram	 *****************
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 1024 - margin.right - margin.left,
    height = 900 - margin.top - margin.bottom;
    
    var i = 0,
    duration = 750,
    root;
    
    var tree = d3.layout.tree()
    .size([height, width]);
    
    var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });
    
    var svg = d3.select("#TreeContainer").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    root = data;
    root.x0 = height / 2;
    root.y0 = 0;
    
    update(root);
    
    d3.select(self.frameElement).style("height", "500px");
    
    function update(source) {
        
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse();
        var links = tree.links(nodes);
        
        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 180; });
        
        // Update the nodes…
        var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });
        
        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", click)
        .style("cursor", function(d){
               return d.children ? "pointer" : "default";
               });
        
        nodeEnter.append("circle")
        // make this co-related to the number of questions?
        .attr("r", 1e-6)
        .style("fill", function(d) {
               if (d.mScore == -1){
               return "#fff";
               }
               var greenAmount = lerp(255, 0, d.mScore/100);
               var redAmount = lerp(0, 255, d.mScore/100);
               var rgb = "rgb("+redAmount+","+greenAmount+",0)";
               return rgb;
               //return d._children ? "lightsteelblue" : "#fff";
               });
        
        nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) {
              return d.children || d._children ? "end" : "start";
              })
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1e-6);
        
        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
        
        nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function(d) {
               if (d.mScore == -1){
               return "#fff";
               }
               var redAmount = lerp(255, 0, d.mScore/2);
               var greenAmount = lerp(0, 255, d.mScore/2);
               var rgb = "rgb("+redAmount+","+greenAmount+",0)";
               return rgb;
               //return d._children ? "lightsteelblue" : "#fff";
               });
        
        nodeUpdate.select("text")
        .style("fill-opacity", 1);
        
        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();
        
        nodeExit.select("circle")
        .attr("r", 1e-6);
        
        nodeExit.select("text")
        .style("fill-opacity", 1e-6);
        
        // Update the links…
        var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });
        
        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
              var o = {x: source.x0, y: source.y0};
              return diagonal({source: o, target: o});
              });
        
        // Transition links to their new position.
        link.transition()
        .duration(duration)
        .attr("d", diagonal);
        
        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
              var o = {x: source.x, y: source.y};
              return diagonal({source: o, target: o});
              })
        .remove();
        
        // Stash the old positions for transition.
        nodes.forEach(function(d) {
                      d.x0 = d.x;
                      d.y0 = d.y;
                      });
    }
    
    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
    
}

$(document).ready(function(){
	$.ajax({url: "/analytics/getConceptTree", success: function(result){
		 $('#treeWait').hide();
		 loadViz(result);
		 }
	});
  $.ajax({url: "/analytics/mean", success: function(result){
      console.log("result");     
     loadData(result);
     }
  });
});
