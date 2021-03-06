// MultiStream.js
// Description: Implementation of MultiStream technique
// Author: Ryan Capps and Ellie Nguyen

////////// TODO ////////////
// 1. Finish interaction for hierarchy manager
// 2. Re-scale focus steamgraph on updated user selection

// Global Variables
var dataset;
var focus_data;
var context_data;
var start_focus;
var end_focus;

////// READING IN CSV ////////////

// create versions of data prep function for use with key/value pairs
// adaptations and originals taken from Matthew Berger, Ellie Nguyen,
// and Ryan Capps implementations from assignment 2
function csv_data_type_conversion(node) {
  if (typeof node.values != "undefined") {
    for (var c = 0; c < node.values.length; c++)
      csv_data_type_conversion(node.values[c]);
    return;
  }
  var time_parser = d3.timeParse("%m/%d/%Y");
  node.date = time_parser(node.date);
}

function csv_add_parent_links(node) {
  if (typeof node.values != "undefined") {
    for (var c = 0; c < node.values.length; c++) {
      node.values[c].parent = node;
      csv_add_parent_links(node.values[c]);
    }
  }
}

function csv_aggregate_counts(node) {
  // Check if in leaf node
  if (typeof node.values == "undefined") {
    // populate leaf node with "counts"
    node.counts = [
      {
        date: node.date,
        count: 1
      }
    ];
  } else {
    // recursive call to make sure all children are aggregated
    for (var i = 0; i < node.values.length; i++) {
      csv_aggregate_counts(node.values[i]);
    }

    // create array to store aggregated data
    var agg_data = [];

    // iterate through all children, all dates
    for (var i = 0; i < node.values.length; i++) {
      for (var j = 0; j < node.values[i].counts.length; j++) {
        // create a temporary entry
        var entry = {};
        entry.date = node.values[i].counts[j].date;
        entry.count = 1;

        // check to see if that date is already in the aggregation
        var flag = 0;
        for (var x = 0; x < agg_data.length; x++) {
          // if we find it, increment count there and exit
          if (agg_data[x].date.getTime() == entry.date.getTime()) {
            flag = 1;
            agg_data[x].count = agg_data[x].count + 1;
          }
        }

        // if the date wasn't already there, add our entry
        if (flag == 0) {
          agg_data.push(entry);
        }
      }
    }
    // set counts for parent to our aggregated data
    node.counts = agg_data;
  }
}

function csv_create_color(root_node) {
  // black color for root
  root_node.color = d3.rgb(0, 0, 0);
  var hue_scale = d3
    .scaleLinear()
    .domain([0, root_node.values.length - 1])
    .range([10, 250]);
  for (var c = 0; c < root_node.values.length; c++) {
    var child_node = root_node.values[c];
    var interpolator = d3.interpolateLab(
      d3.hsl(hue_scale(c), 0.8, 0.3),
      d3.hsl(hue_scale(c), 0.8, 0.8)
    );
    child_node.color = interpolator(0.5);
    for (var d = 0; d < child_node.values.length; d++)
      child_node.values[d].color = interpolator(
        d / (child_node.values.length - 1)
      );
  }
}

function csv_get_all_count_data(node, all_count_data) {
  for (var p = 0; p < node.counts.length; p++)
    all_count_data.push(node.counts[p].count);

  if (typeof node.values != "undefined") {
    for (var c = 0; c < node.values.length; c++)
      csv_get_all_count_data(node.values[c], all_count_data);
  }
}

function csv_add_fields(node) {
  node.name = node.key;
  if (typeof node.values[0].values != "undefined") {
    node.children = node.values;
    for (var i = 0; i < node.children.length; i++) {
      csv_add_fields(node.children[i]);
    }
  } else {
    node.children = [];
  }
}

// Visa data by applicant country of origin
var visaCountry;
async function countryDat() {
  visaCountry = await d3.csv("Visa Data by Country.csv");

  visaCountry = d3
    .nest()
    .key(function(d) {
      return d.all_locations;
    })
    .key(function(d) {
      return d.continent;
    })
    .key(function(d) {
      return d.country;
    })
    .entries(visaCountry);

  visaCountry = visaCountry[0];

  csv_data_type_conversion(visaCountry);
  csv_add_parent_links(visaCountry);
  visaCountry.parent = null;
  csv_create_color(visaCountry);
  csv_aggregate_counts(visaCountry);
  csv_add_fields(visaCountry);
}
countryDat();

// Visa data by employer/sponsor location
var visaEmployer;
async function employerDat() {
  visaEmployer = await d3.csv("Visa Data by Employer.csv");
  visaEmployer = d3
    .nest()
    .key(function(d) {
      return d.all_employers;
    })
    .key(function(d) {
      return d.state;
    })
    .key(function(d) {
      return d.city;
    })
    .entries(visaEmployer);
  visaEmployer = visaEmployer[0];

  csv_data_type_conversion(visaEmployer);
  csv_add_parent_links(visaEmployer);
  visaEmployer.parent = null;
  csv_create_color(visaEmployer);
  csv_aggregate_counts(visaEmployer);
  csv_add_fields(visaEmployer);
}
employerDat();

///// READING IN JSON ///////////
d3.json("music_time_series.json").then(function(data) {
  music_series = data;

  data_type_conversion(music_series);
  add_parent_links(music_series);
  music_series.parent = null;
  create_color(music_series);
  aggregate_counts(music_series);

  create_svg();
  create_hierarchy_manager();

  create_context_streamgraph();
  create_focus_steamgraph();
});

function data_type_conversion(node) {
  if (node.children.length > 0) {
    for (var c = 0; c < node.children.length; c++)
      data_type_conversion(node.children[c]);
    return;
  }
  var time_parser = d3.timeParse("%Y-%m-%d");
  node.counts.forEach(function(d) {
    d.date = time_parser(d.date);
    d.count = +d.count;
  });
}

// add a 'parent' field to each node, so we can access parent data
function add_parent_links(node) {
  for (var c = 0; c < node.children.length; c++) {
    node.children[c].parent = node;
    add_parent_links(node.children[c]);
  }
}

function create_color(root_node) {
  // gray color for root
  root_node.color = d3.rgb(119, 136, 153);
  var hue_scale = d3
    .scaleLinear()
    .domain([0, root_node.children.length - 1])
    .range([10, 250]);
  for (var c = 0; c < root_node.children.length; c++) {
    var child_node = root_node.children[c];
    var interpolator = d3.interpolateLab(
      d3.hsl(hue_scale(c), 0.8, 0.3),
      d3.hsl(hue_scale(c), 0.8, 0.8)
    );
    child_node.color = interpolator(0.5);
    for (var d = 0; d < child_node.children.length; d++)
      child_node.children[d].color = interpolator(
        d / (child_node.children.length - 1)
      );
  }
}

function aggregate_counts(node) {
  // set var to 0 for sum aggregate, 1 for mean
  var mean_ag = 0;

  if (node.children.length > 0) {
    // check if we are in a non-leaf node

    // make recursive calls to make sure we populate all the children
    for (var i = 0; i < node.children.length; i++) {
      aggregate_counts(node.children[i]);
    }

    // create array to store aggregated data
    var agg_data = [];

    // iterate over all dates in the dataset
    for (var i = 0; i < node.children[0].counts.length; i++) {
      var entry = {};

      // get the date for this entry
      entry.date = node.children[0].counts[i].date;

      // iterate over all children
      var sum = 0;
      for (var j = 0; j < node.children.length; j++) {
        sum = sum + node.children[j].counts[i].count;
      }

      // get average if the flag is set
      if (mean_ag === 1) {
        sum = sum / node.children.length;
      }

      entry.count = sum;

      // add new entry to array
      agg_data.push(entry);
    }

    // create/set node 'counts' field
    node.counts = agg_data;
  }
}

// go through all nodes and collect count data
function get_all_count_data(node, all_count_data) {
  for (var p = 0; p < node.counts.length; p++)
    all_count_data.push(node.counts[p].count);
  for (var c = 0; c < node.children.length; c++)
    get_all_count_data(node.children[c], all_count_data);
}

function create_svg() {
  var manager_width = 600, manager_height = 800;
  streamgraph_width = 800;
  streamgraph_height = 800;
  var focus_height = 500;
  var pad = 30;
  context_height = streamgraph_height - focus_height - 2 * pad;
  x_context_scale = d3.scaleTime().range([0, streamgraph_width]);
  y_context_scale = d3.scaleLinear().range([context_height, 0]);
  x_focus_scale = d3.scaleTime().range([0, streamgraph_width]);
  y_focus_scale = d3.scaleLinear().range([focus_height, 0]);
  x_context_axis = d3.axisBottom(x_context_scale);

  d3
    .select("body")
    .append("svg")
    .attr("width", streamgraph_width + manager_width)
    .attr("height", streamgraph_height + manager_height);
  d3
    .select("svg")
    .append("g")
    .attr("id", "focus")
    .attr("transform", "translate(" + (2 * pad + manager_width) + ", 0)");
  d3
    .select("svg")
    .append("g")
    .attr("id", "context")
    .attr(
      "transform",
      "translate(" +
        (2 * pad + manager_width) +
        "," +
        (pad + focus_height) +
        ")"
    );
  d3
    .select("svg")
    .append("g")
    .attr("id", "manager")
    .attr("transform", "translate(" + pad + ",0)");

  d3
    .select("#focus")
    .append("rect")
    .attr("width", streamgraph_width)
    .attr("height", focus_height)
    .attr("fill", "#999999")
    .attr("opacity", 0.1);

  d3
    .select("#context")
    .append("rect")
    .attr("width", streamgraph_width)
    .attr("height", context_height)
    .attr("fill", "#999999")
    .attr("opacity", 0.1);

  d3
    .select("#manager")
    .append("rect")
    .attr("width", manager_width)
    .attr("height", manager_height)
    .attr("fill", "#999999")
    .attr("opacity", 0.1);
  d3.select("#context").append("g").attr("id", "bigBrushGroup");
  d3.select("#context").append("g").attr("id", "smallBrushGroup");
  div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
}

function multimap(
  entries,
  reducer = (p, v) => (p.push(v), p),
  initializer = () => []
) {
  const map = new Map();
  for (const [key, value] of entries) {
    map.set(
      key,
      reducer(map.has(key) ? map.get(key) : initializer(key), value)
    );
  }
  return map;
}

function get_stack(input) {
  var data_for_stack = Array.from(
    multimap(
      input.map(d => [+d.date, d]),
      (p, v) => p.set(v.name, v),
      () => new Map()
    ).values()
  );
  stack = d3
    .stack()
    .keys(Array.from(new Set(input.map(d => d.name))))
    .value((d, key) => d.get(key).value)
    .offset(d3.stackOffsetSilhouette);
  for (const layer of stack(data_for_stack)) {
    for (const d of layer) {
      d.data.get(layer.key).values = [d[0], d[1]];
    }
  }
  return input;
}
function create_context_streamgraph() {
  //TODO(Ellie)
  data = [];
  context_data.map(child => {
    data.push(
      child.counts.map(count => {
        return {
          ...count,
          value: count.count,
          name: child.name
        };
      })
    );
  });
  data = data.flat();
  data = get_stack(data);

  x_context_scale = x_context_scale.domain(d3.extent(data, d => d.date));
  y_context_scale = y_context_scale.domain([
    -d3.max(data, d => d.values[1]),
    d3.max(data, d => d.values[1])
  ]);
  color = d3
    .scaleOrdinal(context_data.map(d => d.color))
    .domain(context_data.map(d => d.name));
  area = d3
    .area()
    .curve(d3.curveLinear)
    .x(d => x_context_scale(d.date))
    .y0(d => y_context_scale(d.values[0]))
    .y1(d => y_context_scale(d.values[1]));
  d3
    .select("#context")
    .append("g")
    .selectAll("path")
    .data([...multimap(data.map(d => [d.name, d]))])
    .enter()
    .append("path")
    .attr("fill", ([name]) => color(name))
    .attr("d", ([, values]) => area(values))
    .append("title")
    .text(([name]) => name);

  d3
    .select("#bigBrushGroup")
    .selectAll(".bigBrush")
    .data(["first", "second"])
    .enter()
    .append("rect")
    .attr("class", "bigBrush")
    .attr("height", context_height)
    .attr("transform", d => {
      if (d === "first") {
        return (
          "translate(" + x_context_scale(date_list[cutoff[0]]) + "," + 0 + ")"
        );
      }
      return (
        "translate(" +
        (x_context_scale(date_list[cutoff[3] - 2]) - 65) +
        "," +
        0 +
        ")"
      );
    });

  d3
    .select("#smallBrushGroup")
    .selectAll(".smallBrush")
    .data(["first", "second"])
    .enter()
    .append("rect")
    .attr("class", "smallBrush")
    .attr("height", context_height)
    .attr("transform", d => {
      if (d === "first") {
        return (
          "translate(" + x_context_scale(date_list[cutoff[1]]) + "," + 0 + ")"
        );
      }
      return (
        "translate(" + x_context_scale(date_list[cutoff[2]]) + "," + 0 + ")"
      );
    });

  var bigBrushX1 = x_context_scale(date_list[cutoff[0]]),
    bigBrushX2 = x_context_scale(date_list[cutoff[3] - 2]) - 65;
  d3.selectAll(".bigBrush").call(
    d3
      .drag()
      .on(
        "drag",
        (ondragstart = function(d) {
          if (d === "first") {
            bigBrushX1 = Math.min(
              d3.event.x,
              bigBrushX2 - 20,
              smallBrushX1 - 20
            );
            d3
              .select(this)
              .attr("transform", "translate(" + bigBrushX1 + "," + 0 + ")");
          } else {
            bigBrushX2 = Math.max(
              d3.event.x,
              bigBrushX1 + 20,
              smallBrushX2 + 20
            );
            bigBrushX2 = Math.min(bigBrushX2, streamgraph_width - 65);
            d3
              .select(this)
              .attr("transform", "translate(" + bigBrushX2 + "," + 0 + ")");
          }
          var invertedx1 = x_context_scale.invert(bigBrushX1),
            invertedx2 = x_context_scale.invert(bigBrushX2);
          closest = date_list[0];
          for (var k = 0; k < date_list.length; k++) {
            if (
              Math.abs(date_list[k].getTime() - invertedx1.getTime()) <
              Math.abs(closest.getTime() - invertedx1.getTime())
            ) {
              closest = date_list[k];
              cutoff[0] = k - 1;
            }
          }
          var closest = date_list[0];
          for (var k = 0; k < date_list.length; k++) {
            if (
              Math.abs(date_list[k].getTime() - invertedx2.getTime()) <
              Math.abs(closest.getTime() - invertedx2.getTime())
            ) {
              closest = date_list[k];
              cutoff[3] = k + 1;
            }
          }
        })
      )
      .on("end", function() {
        create_focus_steamgraph();
      })
  );
  var smallBrushX1 = x_context_scale(date_list[cutoff[1]]),
    smallBrushX2 = x_context_scale(date_list[cutoff[2]]);
  d3.selectAll(".smallBrush").call(
    d3
      .drag()
      .on(
        "drag",
        (ondragstart2 = function(d) {
          if (d === "first") {
            smallBrushX1 = Math.min(d3.event.x, smallBrushX2 - 20);
            d3
              .select(this)
              .attr("transform", "translate(" + smallBrushX1 + "," + 0 + ")");
          } else {
            smallBrushX2 = Math.max(d3.event.x, smallBrushX1 + 20);
            d3
              .select(this)
              .attr("transform", "translate(" + smallBrushX2 + "," + 0 + ")");
          }
          var invertedx1 = x_context_scale.invert(smallBrushX1),
            invertedx2 = x_context_scale.invert(smallBrushX2);
          closest = date_list[0];
          for (var k = 0; k < date_list.length; k++) {
            if (
              Math.abs(date_list[k].getTime() - invertedx1.getTime()) <
              Math.abs(closest.getTime() - invertedx1.getTime())
            ) {
              closest = date_list[k];
              cutoff[1] = k - 1;
            }
          }
          var closest = date_list[0];
          for (var k = 0; k < date_list.length; k++) {
            if (
              Math.abs(date_list[k].getTime() - invertedx2.getTime()) <
              Math.abs(closest.getTime() - invertedx2.getTime())
            ) {
              closest = date_list[k];
              cutoff[2] = k + 1;
            }
          }
        })
      )
      .on("end", create_focus_steamgraph)
  );
  d3
    .select("#context")
    .append("g")
    .attr("id", "x_context_axis")
    .call(d3.axisBottom(x_context_scale).tickFormat(d3.timeFormat("%Y-%m-%d")))
    .attr("transform", "translate(" + 0 + "," + context_height + ")");
}

function create_focus_steamgraph() {
  d3.select("#focus").selectAll("path").remove();

  var focus_width =
    Math.ceil(streamgraph_width / date_list.length) *
    1.5 *
    (cutoff[2] - cutoff[1]);
  var first_width = Math.floor(
    (streamgraph_width - focus_width) /
      (cutoff[1] - cutoff[0] + cutoff[3] - cutoff[2]) *
      (cutoff[1] - cutoff[0])
  );
  var third_width =
    (streamgraph_width - focus_width) /
    (cutoff[1] - cutoff[0] + cutoff[3] - cutoff[2]) *
    (cutoff[3] - cutoff[2]);

  y_focus_scale = y_focus_scale.domain([
    -d3.max(data, d => d.values[1]),
    d3.max(data, d => d.values[1])
  ]);

  color = d3
    .scaleOrdinal(context_data.map(d => d.color))
    .domain(context_data.map(d => d.name));
  first_data = [];
  context_data.map(child => {
    // parent.children.map(child => {
    first_data.push(
      child.counts.slice(cutoff[0], cutoff[1]).map(count => {
        return {
          ...count,
          value: count.count,
          name: child.name
        };
      })
    );
    // });
  });
  first_data = first_data.flat();
  first_data = get_stack(first_data);
  first_scale = d3
    .scaleTime()
    .domain(d3.extent(date_list.slice(cutoff[0], cutoff[1])))
    .range([0, first_width]);
  second_scale = d3
    .scaleTime()
    .domain(d3.extent(date_list.slice(cutoff[1], cutoff[2])))
    .range([first_width, first_width + focus_width]);
  third_scale = d3
    .scaleTime()
    .domain(d3.extent(date_list.slice(cutoff[2], cutoff[3])))
    .range([
      first_width + focus_width,
      first_width + focus_width + third_width
    ]);
  x_focus_scale = x_focus_scale.domain(
    d3.extent(date_list.slice(cutoff[0], cutoff[3]))
  );
  area = d3
    .area()
    .curve(d3.curveLinear)
    .x(d => first_scale(d.date))
    .y0(d => y_focus_scale(d.values[0]))
    .y1(d => y_focus_scale(d.values[1]));
  d3
    .select("#focus")
    .append("g")
    .selectAll("path")
    .data([...multimap(first_data.map(d => [d.name, d]))])
    .enter()
    .append("path")
    .attr("fill", ([name]) => color(name))
    .attr("d", ([, values]) => area(values));

  third_data = [];
  context_data.map(child => {
    // parent.children.map(child => {
    third_data.push(
      child.counts.slice(cutoff[2], cutoff[3]).map(count => {
        return {
          ...count,
          value: count.count,
          name: child.name
        };
      })
    );
    // });
  });
  third_data = third_data.flat();
  third_data = get_stack(third_data);
  //
  area = area.x(d => third_scale(d.date));
  d3
    .select("#focus")
    .append("g")
    .selectAll("path")
    .data([...multimap(third_data.map(d => [d.name, d]))])
    .enter()
    .append("path")
    .attr("fill", ([name]) => color(name))
    .attr("d", ([, values]) => area(values));
  area = area.x(d => second_scale(d.date));
  focus_data = [];
  focus_data1.map(child => {
    // parent.children.map(child => {
    focus_data.push(
      child.counts.slice(cutoff[1], cutoff[2]).map(count => {
        return {
          ...count,
          value: count.count,
          name: child.name
        };
      })
    );
    // });
  });
  focus_data = focus_data.flat();
  focus_data = get_stack(focus_data);
  // Define the div for the tooltip

  color = d3
    .scaleOrdinal(focus_data1.map(d => d.color))
    .domain(focus_data.map(d => d.name));
  d3
    .select("#focus")
    .append("g")
    .selectAll("path")
    .data([...multimap(focus_data.map(d => [d.name, d]))])
    .enter()
    .append("path")
    .attr("fill", ([name]) => color(name))
    .attr("d", ([, values]) => area(values))
    .attr("class", "path")
    .attr("opacity", 1);
  d3
    .select("#focus")
    .selectAll("path")
    .on("mouseover", function(d1, i) {
      d3
        .select("#focus")
        .selectAll(".path")
        .transition()
        .duration(250)
        .attr("opacity", function(d2, j) {
          return d1 !== d2 ? 0.6 : 1;
        });
    })
    .on("mousemove", function(d, i) {
      mousex = d3.mouse(this);
      mousex = mousex[0];
      var invertedx = x_focus_scale.invert(mousex);
      var selected = d[1];
      var closest = selected[0];
      for (var k = 0; k < selected.length; k++) {
        if (
          Math.abs(selected[k].date.getTime() - invertedx.getTime()) <
          Math.abs(closest.date.getTime() - invertedx.getTime())
        ) {
          closest = selected[k];
        }
      }
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(
          closest.name +
            "</br>" +
            Math.floor(closest.value) +
            "</br>" +
            closest.date.toDateString()
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d, i) {
      d3
        .select("#focus")
        .selectAll(".layer")
        .transition()
        .duration(250)
        .attr("opacity", "1");
      div.transition().duration(500).style("opacity", 0);
    });
}

function create_hierarchy_manager() {
  // TODO: Ryan
  dataset = music_series;
  context_data = [dataset];
  focus_data1 = dataset.children.slice(0);

  date_list = dataset.counts.map(d => d.date);
  cutoff = [
    0,
    Math.floor(date_list.length / 3),
    Math.floor(date_list.length / 3 * 2),
    date_list.length + 1
  ];
  // vars describing hierarchy manager size
  var pad = 30, manager_width = 600, manager_height = 800;

  // create band scale for horizontal placement
  // of nodes
  var max_depth = 3;
  var depth_inds = [];
  for (var i = 0; i < max_depth; i++) {
    depth_inds.push(i);
  }
  var depth_band = d3
    .scaleBand()
    .domain(depth_inds)
    .range([0, 1.5 * manager_width]);

  // function to add x/y values to all nodes
  // algorithm adapted from example in lecture
  function generateCoords(node, parent_lower, parent_upper, depth) {
    if (node.children.length == 0) {
      return;
    }

    var node_inds = [];
    for (var i = 0; i < node.children.length; i++) {
      node_inds.push(i);
    }

    var scale_band = d3
      .scaleBand()
      .domain(node_inds)
      .range([parent_lower, parent_upper]);

    for (var i = 0; i < node.children.length; i++) {
      var n_x = depth_band(depth) + depth_band.bandwidth() / 2;
      var n_y = scale_band(i) + scale_band.bandwidth() / 2;

      node.children[i].x = n_x;
      node.children[i].y = n_y;
      node.children[i].source = node;
      node.children[i].target = node.children[i];

      var n_y_lower = scale_band(i);
      var n_y_upper = scale_band(i) + scale_band.bandwidth();
      generateCoords(node.children[i], n_y_lower, n_y_upper, depth + 1);
    }
  }
  dataset.x = pad;
  dataset.y = manager_height / 2;
  generateCoords(dataset, manager_height, 0, 0);

  // create horizontal link scale
  var horizontal_link = d3.linkHorizontal().x(d => d.x).y(d => d.y);

  // nested data joins to add nodes and links
  d3
    .select("#manager")
    .selectAll("nodes")
    .data([dataset])
    .enter()
    .append("g")
    .attr("class", "depth0");

  for (var i = 0; i < max_depth; i++) {
    d3
      .selectAll(".depth" + i)
      .selectAll("nodes")
      .data(d => d.children)
      .enter()
      .append("g")
      .attr("class", "depth" + (i + 1));

    d3
      .selectAll(".depth" + (i + 1))
      .append("path")
      .attr("d", d => horizontal_link(d))
      .attr("fill", "none")
      .attr("stroke", "#666666")
      .attr("opacity", 1.0)
      .attr("stroke-width", 1);
  }

  d3
    .selectAll(".depth0")
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 6)
    .attr("fill", "#999999")
    .attr("stroke", "#444444")
    .attr("stroke-width", "1")
    .attr("opacity", 1.0);

  d3
    .selectAll(".depth0")
    .append("text")
    .attr("x", d => d.x)
    .attr("y", d => d.y - 10)
    .text(d => d.name)
    .attr("font-size", "20px")
    .attr("fill", "black");
  for (var i = 0; i < max_depth; i++) {
    d3
      .selectAll(".depth" + (i + 1))
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 6)
      .attr("fill", "#999999")
      .attr("stroke", "#444444")
      .attr("stroke-width", "1")
      .attr("opacity", 1.0);

    if (i == 0) {
      d3
        .selectAll(".depth" + (i + 1))
        .append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y - 10)
        .text(d => d.name)
        .attr("font-size", "12px")
        .attr("fill", "black");
    } else {
      d3
        .selectAll(".depth" + (i + 1))
        .append("text")
        .attr("x", d => d.x + 10)
        .attr("y", d => d.y + 5)
        .text(d => d.name)
        .attr("font-size", "12px")
        .attr("fill", "black");
    }
  }

  var symbol = d3
    .select("#manager")
    .append("g")
    .attr("id", "button")
    .attr("transform", "translate(" + 300 + "," + 300 + ")")
    .style("opacity", 0);
  symbol
    .selectAll(".symbol")
    .data([[90, 0], [270, -30]])
    .enter()
    .append("g")
    .attr("transform", d => "translate(" + d[1] + ",0)")
    .append("path")
    .attr("d", d3.symbol().type(d3.symbolTriangle))
    // .style("opacity", 0)
    .attr("transform", d => "rotate(" + d[0] + ")")
    .on("click", handleClick);

  d3
    .select("#manager")
    .selectAll("circle")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  d3
    .select("#manager")
    .selectAll("circle")
    .filter(function(d) {
      return context_data.includes(d);
    })
    .attr("fill", "blue");
  d3
    .select("#manager")
    .selectAll("circle")
    .filter(function(d) {
      return focus_data1.includes(d);
    })
    .attr("fill", "red");

  var selectedNode;

  function handleClick(data, i) {
    symbol.style("opacity", 1);
    if (data[0] === 90) {
      var d = selectedNode.data()[0];
      if (focus_data1.includes(d) && d.children.length !== 0) {
        var to_insert = focus_data1.indexOf(d);
        selectedNode.attr("fill", "#9999");
        focus_data1.splice(focus_data1.indexOf(d), 1);
        focus_data1.splice(to_insert, 0, ...d.children);
        d3
          .select("#manager")
          .selectAll("circle")
          .filter(function(d) {
            return focus_data1.includes(d);
          })
          .attr("fill", "red");
      } else if (
        context_data.includes(d) &&
        focus_data1.filter(value => -1 !== d.children.indexOf(value)).length ===
          0
      ) {
        selectedNode.attr("fill", "#9999");
        context_data.splice(context_data.indexOf(d), 1);
        context_data.push(...d.children);
        d3
          .select("#manager")
          .selectAll("circle")
          .filter(function(d) {
            return context_data.includes(d);
          })
          .attr("fill", "blue");
      }
    } else {
      var d = selectedNode.data()[0];
      if (
        focus_data1.includes(d) &&
        d.parent !== null &&
        !context_data.includes(d.parent)
      ) {
        for (var children of d.parent.children) {
          if (focus_data1.includes(children)) {
            focus_data1.splice(focus_data1.indexOf(children), 1);
          }
        }
        focus_data1.push(d.parent);
      } else if (context_data.includes(d) && d.parent !== null) {
        selectedNode.attr("fill", "#9999");
        for (var children of d.parent.children) {
          if (context_data.includes(children)) {
            context_data.splice(context_data.indexOf(children), 1);
          }
        }
        context_data.splice(context_data.indexOf(d), 1);
        context_data.push(d.parent);
      }
      d3
        .select("#manager")
        .selectAll("circle")
        .filter(function(d) {
          return context_data.includes(d);
        })
        .attr("fill", "blue");
      d3
        .select("#manager")
        .selectAll("circle")
        .filter(function(d) {
          return focus_data1.includes(d);
        })
        .attr("fill", "red");
      d3
        .select("#manager")
        .selectAll("circle")
        .filter(function(d) {
          return !focus_data1.includes(d) && !context_data.includes(d);
        })
        .attr("fill", "#9999");
    }
    create_context_streamgraph();
    create_focus_steamgraph();
  }
  function handleMouseOver(d, i) {
    // Add interactivity

    symbol.style("opacity", 1);
    selectedNode = d3.select(this);
    symbol.attr(
      "transform",
      "translate(" +
        selectedNode.attr("cx") +
        "," +
        selectedNode.attr("cy") +
        ")"
    );
  }

  function handleMouseOut(d, i) {
    // Add interactivity
    // symbol.selectAll("g").style("opacity", 1);
  }
}
