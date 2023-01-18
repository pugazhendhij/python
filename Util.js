import React from "react";
import { Fragment } from "react";

const focusNextElement = () => {
  console.log("focusNextElement called..!");
  //add all elements we want to include in our selection
  //let focussableElements =
  //'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';

  //Working
  //let focussableElements =
  //'input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';

  //let focussableElements =
  //'input[type=text]:not([disabled]),input[type=checkbox]:not([disabled]),button.enterFocus, [tabindex]:not([disabled]):not([tabindex="-1"])';

  //let focussableElements =
  //'input[type=text]:not([disabled]),button.enterFocus,[tabindex]:not([disabled]):not([tabindex="-1"]),div:not([childType="popupChild"])';

  //let focussableElements =
  //'input[type=text]:not([disabled]),button.enterFocus,[tabindex]:not([disabled]):not([tabindex="-1"])';

  let focussableElements =
    'input[type=text]:not([disabled]),input[type=password]:not([disabled]),input[type=checkbox]:not([disabled]),input[type=date]:not([disabled]),button.enterFocus,[tabindex]:not([disabled]):not([tabindex="-1"]):not([tabindex="0"])';

  if (document.activeElement) {
    console.log(
      "focusNextElement : document.activeElement : ",
      document.activeElement
    );
    //let moduleContainerElement = document.getElementById("moduleContainer");

    let moduleContainerElement = findModuleParent(
      document.activeElement,
      "moduleContainer"
    );
    console.log("moduleContainerElement : ", moduleContainerElement);
    if (isEmpty(moduleContainerElement)) {
      console.log("moduleContainerElement is Empty!");
      return;
    }

    /*
    let focussable = Array.prototype.filter.call(
      document
        .getElementById("moduleContainer")
        .querySelectorAll(focussableElements),
      function (element) {
        //check for visibility while always include the current activeElement
        return (
          element.offsetWidth > 0 ||
          element.offsetHeight > 0 ||
          element === document.activeElement
        );
      }
    );
    */

    let focussable = Array.prototype.filter.call(
      moduleContainerElement.querySelectorAll(focussableElements),
      function (element) {
        //check for visibility while always include the current activeElement
        return (
          element.offsetWidth > 0 ||
          element.offsetHeight > 0 ||
          element === document.activeElement
        );
      }
    );

    //console.log("Focusable Elements : ", focussable);

    let index = focussable.indexOf(document.activeElement);
    if (index > -1) {
      console.log(focussable[0]);
      console.log("focussable[0]", focussable[0]);
      console.log(focussable[index + 1]);
      console.log("focussable[index + 1]", focussable[index + 1]);
      let nextElement = focussable[index + 1] || focussable[0];
      nextElement.focus();
      console.log("nextElement", nextElement);
    }
  }
};

const findModuleParent1 = (el, id) => {
  while ((el = el.parentElement) && !el.id === id);
  return el;
};

const findModuleParent = (el, id) => {
  if (isEmpty(el)) return null;
  while (true) {
    el = el.parentElement;
    //console.log("Element Paent : ", el);
    if (isEmpty(el)) return null;
    if (el.id === id) return el;
  }
  //return null;
};

const isEmpty = (value) => {
  return typeof value === "undefined" || value === null || value.length === 0;
};

const isEmptyArray = (value) => {
  return typeof value === "undefined" || value === null || value.length === 0;
};

const isEmptyString = (value) => {
  return !value || value == undefined || value == "" || value.length == 0;
};

const toBoolean = (value) => {
  let finalValue = false;
  if (!isEmpty(value)) {
    if (value == "Y" || value == "TRUE" || value == "1") finalValue = true;
  } else finalValue = false;
  return finalValue;
};

//var x = document.getElementById("demo");
/*
const scrollToElement = (elementId, elementParentId) => {
  let element = document.getElementById(elementId);
  if (element) {
    //element.scrollIntoView();
    element.scrollIntoViewIfNeeded();
  }
};
*/

const scrollToElement = (elementId, elementParentId) => {
  let element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }
};

const toInteger = (value) => {
  if (isEmpty(value)) {
    return 0;
  } else {
    return parseInt(value);
  }
};

const toDecimal = (value) => {
  if (isEmpty(value)) {
    return 0;
  } else {
    return parseFloat(value);
  }
};

export {
  focusNextElement,
  isEmpty,
  isEmptyArray,
  isEmptyString,
  toBoolean,
  scrollToElement,
  toInteger,
  toDecimal,
};
