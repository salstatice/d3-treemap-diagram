let videoGameData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
let movieData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
let kickstarterData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

// set up menu
let menu = d3.select("#menu");

menu.append("a").
attr("class", "menu-link").
text("Video Game Data Set").
on("click", function () {
  this.text = "clicked";
  let title = "Video Game Sales";
  let description = "Top 100 Most Sold Video Games Grouped by Platform";
  getTitle(title, description);
  loadData(videoGameData).then(showData);
});
menu.append("a").
attr("class", "menu-link").
text("Movies Data Set").
on("click", function () {
  let title = "Movie Sales";
  let description = "Something about Movies";
  getTitle(title, description);
  loadData(movieData).then(showData);
});
menu.append("a").
attr("class", "menu-link").
text("Kickstart Data Set").
on("click", function () {
  let title = "Kickstarter";
  let description = "Something about Kickstarter";
  getTitle(title, description);
  loadData(kickstarterData).then(showData);
});

// initial loading
getTitle("Video Game Sales", "Top 100 Most Sold Video Games Grouped by Platform");
loadData(videoGameData).then(showData);


function loadData(url) {
  return d3.json(url);
}

function getTitle(title = "", description = "") {
  d3.select("#title").
  text(title);
  d3.select("#description").
  text(description);
}

function showData(data) {

  // config container
  let container = d3.select("#container");
  let containerWidth = +container.attr("width");
  let containerHeight = +container.attr("height");

  // tooltip
  let tooltip = d3.select("#tooltip").
  style("opacity", 0.1).
  text("Tooltip");

  // config treemap
  let treemap = d3.treemap().
  size([containerWidth, containerHeight]).
  paddingInner(1);

  let root = d3.hierarchy(data).
  sum(d => d.value);

  treemap(root);


  // color scale
  let cScale = d3.scaleOrdinal(d3.schemeTableau10.concat(d3.schemeSet2));

  // draw treemap
  container.selectAll("g").remove();

  let cell = container.selectAll("g").
  data(root.leaves()).
  enter().
  append("g").
  attr("transform", d => `translate(${d.x0},${d.y0})`);

  cell.append("rect").
  attr("class", "tile").
  attr("width", d => d.x1 - d.x0).
  attr("height", d => d.y1 - d.y0).
  attr("data-name", d => d.data.name).
  attr("data-category", d => d.data.category).
  attr("data-value", d => d.data.value).
  attr("fill", d => cScale(d.parent.data.name)).
  on("mouseover", (event, d) => {
    tooltip.transition().
    duration(200).
    style("opacity", 0.9).
    attr("data-value", d.data.value);
    tooltip.html(
    "Name: " + d.data.name +
    "<br>Catgegory: " + d.data.category +
    "<br>Value: " + d.data.value).
    style("left", event.pageX + "px").
    style("top", event.pageY + "px");
  }).on("mouseout", (event, d) => {
    tooltip.transition().
    duration(500).
    style("opacity", 0);
  });

  cell.append("text").
  attr("class", "tile-text").
  selectAll("tspan").
  data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g)).
  enter().
  append("tspan").
  attr("x", 3).
  attr("y", (d, i) => i * 11 + 12).
  text(d => d).
  attr("fill", "white");

  // legend
  // let categories = root.leave().map(d => d.data.category)
  let categories = root.children.map(d => d.data.name);
  showLegend(categories, cScale);

}

function showLegend(categoryList, scale) {
  let elemPerRow = 4;
  let elemWidth = 200;
  let elemHeight = 30;
  let rectSize = 20;
  let padding = 5;

  d3.select("#legend").
  append("g").
  attr("id", "legend-group").
  attr("transform", "translate(150,10)");

  let legend = d3.select("#legend-group");

  legend.selectAll("g").remove();

  let legendBlock = legend.
  selectAll("g").
  data(categoryList).
  enter().
  append("g").
  attr("transform", (d, i) => getLegendCoor(i, elemPerRow, elemWidth, elemHeight));

  legendBlock.
  append("rect").
  attr("class", "legend-item").
  attr("width", rectSize).
  attr("height", rectSize).
  attr("fill", d => scale(d));

  legendBlock.
  append("text").
  attr("class", "legend-text").
  attr("alignment-baseline", "middle").
  attr("x", rectSize + padding).
  attr("y", rectSize / 2).
  text(d => d);

}

function getLegendCoor(i, elemPerRow, elemWidth, elemHeight) {

  let row = Math.floor(i / elemPerRow);
  let column = i % elemPerRow;

  return "translate(" + column * elemWidth + "," + row * elemHeight + ")";
}