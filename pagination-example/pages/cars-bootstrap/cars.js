const URL = "http://localhost:8080/api/";
import { paginator } from "../../lib/paginator/paginate-bootstrap.js";
import { sanitizeStringWithTableRows } from "../../utils.js";
const SIZE = 10;
const amount = 1000;
//const amount =  getAmountOfCars();
const TOTAL = Math.ceil(amount / SIZE); //Should come from the backend///useBootStrap(true)

const navigoRoute = "cars-v2";

let cars = [];

let sortField = "id";
let sortOrder = "asc";

let initialized = false;

//TODO: fix --------------------------------------------------------------------
async function getAmountOfCars() {
  try {
    const response = await fetch(URL + "car/amount");
    const data = await response.json();
    return data.amount;
  } catch (error) {
    console.error("Error fetching amount of cars:", error);
    return null;
  }
}

function handleSort(pageNo, match, sortBy) {
  sortOrder = sortOrder == "asc" ? "desc" : "asc";
  sortField = sortBy;
  load(pageNo, match);
}
/* 
document
  .getElementById("header-brand")
  .addEventListener("click", () => load(1));
 */

//TODO: når man sorterer første gangen, hopper den 1 side frem etc..-------------------------

export async function load(pg, match) {
  //We dont wan't to setup a new handler each time load fires
  console.log(pg);
  console.log(match);

  const p = match?.params?.page || pg; //To support Navigo
  let pageNo = Number(p);

  console.log(pageNo);

  if (document.getElementById("sorting-selector").onclick == null) {
    document.getElementById("sorting-selector").onclick = function (evt) {
      evt.preventDefault();
      const sortBy = evt.target.dataset.sortBy;
      console.log(sortBy);
      handleSort(pageNo, match, sortBy);
    };
    initialized = true;
  }

  // ?page=1&size=3&sort=brand,asc
  let queryString = `?page=${
    pageNo - 1
  }&size=${SIZE}&sort=${sortField},${sortOrder}`;
  // kun frontend: `?sort=${sortField}&order=${sortOrder}&limit=${SIZE}&page=` + (pageNo - 1);

  try {
    cars = await fetch(`${URL}car${queryString}`).then((res) => res.json());
  } catch (e) {
    console.error(e);
  }
  const rows = cars
    .map(
      (car) => `
  <tr>
    <td>${car.id}</td>
    <td>${car.brand}</td>
    <td>${car.model}</td>
    <td>${car.color}</td>
    <td>${car.kilometers}</td>
  `
    )
    .join("");

  //DON'T forget to sanitize the string before inserting it into the DOM
  document.getElementById("tbody").innerHTML =
    sanitizeStringWithTableRows(rows);

  // (C1-2) REDRAW PAGINATION
  paginator({
    target: document.getElementById("car-paginator"),
    total: TOTAL,
    current: pageNo,
    click: load,
  });

  //Update URL to allow for CUT AND PASTE when used with the Navigo Router
  //callHandler: false ensures the handler will not be called again (twice)
  window.router?.navigate(`/${navigoRoute}${queryString}`, {
    callHandler: false,
    updateBrowserURL: true,
  });
}
