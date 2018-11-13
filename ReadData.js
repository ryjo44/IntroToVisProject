// ReadData.js
// Description: Reads in data from either JSON or CSV format.
//              Groups the data along relevant hierachical groups.
// Author: Ryan Capps and Ellie Nguyen

////// READING IN CSV ////////////

// Visa data by applicant country of origin
visaCountry = d3.csv("Clean Visa Data by Country.csv", function(d) {
  return {
    status: d.status,
    visa_type: d.visa_type,
    country: d.country,
    continent: d.continent
  };
});

visCountry = d3
  .nest()
  .key(function(d) {
    return d.continent;
  })
  .key(function(d) {
    return d.country;
  })
  .rollup(function(v) {
    return v.length;
  })
  .entries(visaCountry);

// Visa data by employer/sponsor location
visaEmployer = d3.csv("Visa Data by Employer.csv", function(d) {
  return {
    status: d.status,
    visa_type: d.visa_type,
    city: d.job_city,
    state: d.job_state
  };
});

visaEmployer = d3
  .nest()
  .key(function(d) {
    return d.state;
  })
  .key(function(d) {
    return d.city;
  })
  .rollup(function(v) {
    return v.length;
  })
  .entries(visaEmployer);

///// READING IN JSON ///////////
d3.json("music_time_series.json").then(function(data) {
  music_series = data;
  data_type_conversion(music_series);
  add_parent_links(music_series);
  music_series.parent = null;
  create_color(music_series);
  aggregate_counts(music_series);
  plot_it();
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

function plot_it() {
    var width = 800, height = 800;
    var focus_height = 600;
    var pad = 30;
    d3.select('body').append('svg').attr('width', width).attr('height', height);
    d3.select('svg').append('g').attr('id', 'focus');
    d3.select('svg').append('g').attr('transform', 'translate(' + 0 + ',' + (pad + focus_height)  + ')').attr('id', 'context');
    d3.select('#focus').append('rect').attr('width', width).attr('height', focus_height).attr('fill', '#999999').attr('opacity', 0.1);
    d3.select('#context').append('rect').attr('width', width).attr('height', (height - focus_height - pad)).attr('fill', '#999999').attr('opacity', 0.1);
}

