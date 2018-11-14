// MultiStream.js
// Description: Implementation of MultiStream technique
// Author: Ryan Capps and Ellie Nguyen


// Global Variables
//var dataset = music_series;
//var focus_data = music_series;
//var context_data = music_series;
//var start_focus;
//var end_focus;

////// READING IN CSV ////////////

// create versions of data prep function for use with key/value pairs
function csv_data_type_conversion(node) {
  if (typeof node.values != 'undefined') {
    for (var c = 0; c < node.values.length; c++)
      csv_data_type_conversion(node.values[c]);
    return;
  }
  var time_parser = d3.timeParse("%m/%d/%Y");
  node.date = time_parser(node.date)
}

function csv_add_parent_links(node) {
  if (typeof node.values != 'undefined') {
    for (var c = 0; c < node.values.length; c++) {
      node.values[c].parent = node;
      csv_add_parent_links(node.values[c]);
    }
  }
}

// TODO: Ryan
// Figure out how to perform aggregation with each leaf node
// having a different set of dates
function csv_aggregate_counts(node) {

  // Check if in leaf node
  if (typeof node.values == 'undefined') {
    // populate leaf node with "counts"
    node.counts = [{date : node.date,
                   count : 1}]
  } else {
    // recursive call to make sure all children are aggregated
    for (var i = 0; i < node.values.length; i++) {
      csv_aggregate_counts(node.values[i])
    }

    // create array to store aggregated data
    var agg_data = []

    // iterate through all children, all dates
    for (var i = 0; i < node.values.length; i++) {
      for (var j = 0; j < node.values[i].counts.length; j++) {

        // create a temporary entry
        var entry = {}
        entry.date = node.values[i].counts[j].date
        entry.count = 1

        // check to see if that date is already in the aggregation
        var flag = 0
        for (var x = 0; x < agg_data.length; x++) {
          // if we find it, increment count there and exit
          if (agg_data[x].date.getTime() == entry.date.getTime()) {
            flag = 1;
            agg_data[x].count = agg_data[x].count + 1
          }
        }

        // if the date wasn't already there, add our entry
        if (flag == 0) {
          agg_data.push(entry)
        }
      }
    }
    // set counts for parent to our aggregated data
    node.counts = agg_data
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

  if (typeof node.values != 'undefined') {
    for (var c = 0; c < node.values.length; c++)
      csv_get_all_count_data(node.values[c], all_count_data);
  }
}


// Visa data by applicant country of origin
var visaCountry;
async function countryDat() {
  visaCountry = await d3.csv("Visa Data by Country.csv")

  visaCountry = d3
    .nest()
    .key(function(d) {
      return d.all_locations
    })
    .key(function(d) {
      return d.continent;
    })
    .key(function(d) {
      return d.country;
    })
    .entries(visaCountry)

    visaCountry = visaCountry[0]

    csv_data_type_conversion(visaCountry)
    csv_add_parent_links(visaCountry)
    visaCountry.parent = null
    csv_create_color(visaCountry)
    csv_aggregate_counts(visaCountry)
}
countryDat()

// Visa data by employer/sponsor location
var visaEmployer;
async function employerDat() {
visaEmployer = await d3.csv("Visa Data by Employer.csv")
visaEmployer = d3
  .nest()
  .key(function(d) {
    return d.all_employers
  })
  .key(function(d) {
    return d.state;
  })
  .key(function(d) {
    return d.city;
  })
  .entries(visaEmployer);
  visaEmployer = visaEmployer[0]

  csv_data_type_conversion(visaEmployer)
  csv_add_parent_links(visaEmployer)
  visaEmployer.parent = null
  csv_create_color(visaEmployer)
  csv_aggregate_counts(visaEmployer)
}
employerDat()

///// READING IN JSON ///////////
d3.json("music_time_series.json").then(function(data) {
  music_series = data;
  data_type_conversion(music_series);
  add_parent_links(music_series);
  music_series.parent = null;
  create_color(music_series);
  aggregate_counts(music_series);
  create_svg();
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
  // black color for root
  root_node.color = d3.rgb(0, 0, 0);
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
  var width = 800, height = 800;
  var focus_height = 600;
  var pad = 30;
  var context_height = height - focus_height - pad;
  d3.select("body").append("svg").attr("width", width).attr("height", height);
  d3.select("svg").append("g").attr("id", "focus");
  d3
    .select("svg")
    .append("g")
    .attr("transform", "translate(" + 0 + "," + (pad + focus_height) + ")")
    .attr("id", "context");
  d3
    .select("#focus")
    .append("rect")
    .attr("width", width)
    .attr("height", focus_height)
    .attr("fill", "#999999")
    .attr("opacity", 0.1);
  d3
    .select("#context")
    .append("rect")
    .attr("width", width)
    .attr("height", height - focus_height - pad)
    .attr("fill", "#999999")
    .attr("opacity", 0.1);

  count_data = [];
  get_all_count_data(music_series, count_data);
  var y_context_scale = d3
    .scaleLinear()
    .domain([d3.min(count_data), d3.max(count_data)])
    .range([context_height, 0]);
  var dates = [];
  music_series.counts.forEach(function(count) {
    dates.push(count.date);
  });
  var x_context_scale = d3
    .scaleTime()
    .domain([d3.min(dates), d3.max(dates)])
    .range([0, width]);
  var x_context_axis = d3
    .axisBottom()
    .scale(x_context_scale)
    .tickSize(5, 0)
    .tickPadding(5);
  var y_context_axis = d3
    .axisLeft()
    .scale(y_context_scale)
    .tickSize(-width, 0)
    .tickPadding(5);
}

function create_context_streamgraph() { //TODO(Ellie)

}

function create_focus_steamgraph() { // TODO

}

function create_hierarchy_manager() { // TODO: Ryan

}
