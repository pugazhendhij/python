import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Fragment, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  FormLabel,
  FormControl,
  FormCheck,
  Button,
  Modal,
  Form,
} from "react-bootstrap";

import {
  CollapseMaximizeIcon,
  CollapseMinimizeIcon,
  SearchImageIcon,
  FilterIcon,
  RefreshIcon,
  CalendarIcon,
  AddIcon,
} from "./Icons.js";
import DataTable from "react-data-table-component";
import SkyLight, { SkyLightStateless } from "react-skylight";
import { Typeahead, AsyncTypeahead } from "react-bootstrap-typeahead";
import { focusNextElement, isEmpty, scrollToElement } from "./Util.js";
import { RestAddressBean, PageListBean } from "../ds/ds.js";
import NumberFormat from "react-number-format";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import BootstrapTable from "react-bootstrap-table-next";
//import cellEditFactory from "react-bootstrap-table-next-editor";
import cellEditFactory from "react-bootstrap-table2-editor";

import {
  ApplicationDataContext,
  ApplicationDataContextProvider,
} from "../ApplicationGlobalState.js";

import { ReasonBean } from "../ds/ds.js";

import { LookupResultDetails } from "../ds/lookup_ds.js";

import moment from "moment";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
// import "../../node_modules/reactjs-popup/dist/index.css";

export const customEventObject = (fieldName, selectedValue) => {
  let t = { name: fieldName, value: selectedValue };
  let e = { target: t };
  return e;
};

export class TextBlock_FW extends React.Component {
  constructor(props) {
    super(props);
    this.state = { textValue: this.props.value };
  }

  render() {
    return (
      <FormLabel className="text-block-container">
        {this.state.textValue}
      </FormLabel>
    );
  }
}

class InputCheckbox extends React.Component {
  constructor(props) {
    super(props);
    this.lookupRef = React.createRef();
    this.componentRef = React.createRef();
    this.state = { checked: this.props.checked, label: "" };
  }

  componentDidUpdate() {
    if (this.props.checked !== this.state.checked) {
      if (this.props.checked == true) {
        this.setState({
          label: "Yes",
        });
      } else {
        this.setState({
          label: "No",
        });
      }
      this.setState({ checked: this.props.checked });
    }
  }

  handleFocus = (event) => {
    event.target.select();
  };

  handleKeyDown = (event) => {
    if (event.keyCode == 13) {
      //console.log("Enter Key is Pressed!", event.keyCode);
      focusNextElement();
    }
  };

  handleOnChange = (event) => {
    let isChecked = event.target.checked;
    this.setState({ checked: isChecked });

    let tempEventObejct = customEventObject(this.props.name, isChecked);
    this.props.onChange(tempEventObejct);
    if (isChecked == true) {
      this.setState({
        label: "Yes",
      });
    } else {
      this.setState({
        label: "No",
      });
    }
  };

  render() {
    return (
      <>
        {this.props.lable && (
          <label className="col-sm-12">{this.props.lable}</label>
        )}
        <FormCheck
          className="form-check"
          type="checkBox"
          {...this.props}
          label={this.state.label}
          checked={this.state.checked}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
          onChange={this.handleOnChange}
          disabled={this.props.disabled}
        />
      </>
    );
  }
}

class InputTextbox extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.lookupRef = React.createRef();
    this.componentRef = React.createRef();

    this.state = {
      textValue: this.props.value,
      isReadOnly: this.props.readOnly,
      currentRowIndex: 0,
      activeSuggestion: 0,
      showSuggestions: true,
    };

    /*
    let disabled = false;
    if (this.state.isDisabled !== true) {
      if (this.props.disabled == "" || this.props.disabled == null) {
        disabled = this.props.readOnly;
      } else {
        disabled = this.props.disabled;
      }
    } else {
      disabled = this.state.isDisabled;
    }
    */
  }

  componentDidUpdate() {
    if (this.props.value !== this.state.textValue)
      this.setState({ textValue: this.props.value });
  }

  componentDidMount() {
    this.modifyTextBox();
    if (this.props.value !== this.state.textValue)
      this.setState({ textValue: this.props.value });
  }

  modifyTextBox = () => {
    if (this.props.isModifyView != null) {
      if (this.props.isModifyView) {
        if (this.props.isModifyEditable != null) {
          if (this.props.isModifyEditable) {
            this.setState({
              isReadOnly: this.props.isModifyEditable,
              isDisabled: this.props.isModifyEditable,
            });
          } else {
            this.setState({
              //isReadOnly: !this.props.isModifyView,
              isDisabled: !this.props.isModifyView,
              isReadOnly: !this.props.isModifyView,
            });
          }
        } else {
          this.setState({
            //isReadOnly: !this.props.isModifyView,
            isDisabled: !this.props.isModifyView,
            isReadOnly: !this.props.isModifyView,
          });
        }
      } else {
        if (this.props.isModifyEditable != null) {
          this.setState({
            isReadOnly: this.props.isModifyEditable,
            isDisabled: this.props.isModifyEditable,
          });
        }
      }
    }
    // console.log("isReadOnly", this.state.isReadOnly);
    // console.log("isDisabled", this.state.isDisabled);
  };

  clear() {
    this.setState({ textValue: "" });
  }

  handleFocus = (event) => {
    //event.target.select();

    if (
      this.props.enableAutoCompleteTextBox === true &&
      this.props.enableAutoCompleteTextBox != undefined
    ) {
      this.props.displayAutoCompleteList(true);
      this.setState({ activeSuggestion: 0 });
    }
    this.componentRef.current.select();
  };

  focus = () => {
    this.componentRef.current.focus();
  };

  handleKeyDown = (event) => {
    //console.log("A key was pressed[keydown]", event.keyCode);
    const { showAutoCompleteList } = this.props;

    if (event.keyCode == 13) {
      //focusNextElement();
      if (
        this.props.enableAutoCompleteTextBox === true &&
        this.props.autoCompleteListData != null &&
        showAutoCompleteList === true
      ) {
        let dataList = this.props.autoCompleteListData;
        let currentRow = dataList[this.state.currentRowIndex];

        if (
          this.props.enterKeyEventHandler &&
          currentRow != undefined &&
          currentRow != null
        ) {
          let targetFieldName = event.target.name;
          let code = currentRow.code;

          let t = { name: targetFieldName, value: code };
          let e = { target: t };
          this.props.enterKeyEventHandler(e);

          this.setState({ activeSuggestion: 0 });
          //focusNextElement();
        }
      } else {
        if (this.props.enterKeyEventHandler) {
          this.props.enterKeyEventHandler(event);
          //return;
        }
        //focusNextElement();
      }
      //console.log("Enter Key is Pressed!", event.keyCode);
      //this.setState({showSuggestions:false});

      setTimeout(() => {
        this.focus();
        focusNextElement();
      }, 100);
      this.componentRef.current.blur();
    }

    if (event.keyCode == 113) {
      if (this.props.lookupRequired === true) {
        this.handleLookup();
        //PopupWindow
      }
    }

    // up key for autocomplete
    //if(this.props.enableAutoCompleteTextBox === true && this.props.autoCompleteListData != null  && displayAutoCompleteList ===  true){
    if (
      this.props.enableAutoCompleteTextBox === true &&
      showAutoCompleteList === true
    ) {
      if (event.keyCode === 38) {
        //up key
        let currentRowIndex = this.state.currentRowIndex - 1;
        let dataList = this.props.autoCompleteListData;
        if (dataList) {
          if (currentRowIndex < 0) {
            currentRowIndex = dataList.length - 1;
            if (currentRowIndex < 0) currentRowIndex = 0;
          }
        } else {
          currentRowIndex = 0;
        }
        this.setState({ currentRowIndex: currentRowIndex });
        this.scrollToRow(currentRowIndex);
        event.preventDefault();
        this.setState({ activeSuggestion: currentRowIndex });
      }

      if (event.keyCode === 40) {
        //down key
        let currentRowIndex = this.state.currentRowIndex + 1;
        let dataList = this.props.autoCompleteListData;
        if (dataList) {
          if (currentRowIndex >= dataList.length) {
            currentRowIndex = 0;
          }
        } else {
          currentRowIndex = 0;
        }
        this.setState({ currentRowIndex: currentRowIndex });
        this.scrollToRow(currentRowIndex);
        event.preventDefault();
        this.setState({ activeSuggestion: currentRowIndex });
      }
    }

    let isCustomHandledKeyDown = this.props.isCustomHandledKeyDown;
    if (isCustomHandledKeyDown) {
      this.props.customeOnKeyDown(event);
    }
    if (this.props.onKeyDown) {
      this.props.onKeyDown(event);
    }
    //focusNextElement();
  };

  scrollToRow = (currentRowIndex) => {
    let rowId = "row-" + currentRowIndex;
    //console.log("rowid" , rowId);
    scrollToElement(rowId);
    //this.current.scrollIntoView(false);
    /*
    let divNode = ReactDOM.findDOMNode(rowId);
    //console.log(divNode);
    if (divNode) {
      //console.log(divNode);
      divNode.scrollIntoView();
    }
    */
  };

  handleLookup = () => {
    //let content = <div>This is Handle Lookup!</div>;
    //this.popup_ref.current.showPopup(content);
    this.lookupRef.current.showLookup();
  };

  onBlur = (event) => {
    //if (this.props.onBlur != null && this.props.onBlur != undefined)
    //this.props.onBlur(event);
    if (this.props.valueChangeOnBlur == true) {
      let tempEventObejct = customEventObject(
        this.props.name,
        this.state.textValue
      );
      if (
        this.props.onValueChangeOnBlur != null &&
        this.props.onValueChangeOnBlur != undefined
      )
        this.props.onValueChangeOnBlur(tempEventObejct);
    }
    if (
      this.props.enableAutoCompleteTextBox === true &&
      this.props.enableAutoCompleteTextBox != undefined
    ) {
      setTimeout(() => {
        this.props.displayAutoCompleteList(false);
      }, 100);
      this.setState({ activeSuggestion: 0, currentRowIndex: 0 });
      //this.props.displayAutoCompleteList(false);
    }
  };

  /*
  onChange = (event) => {
    if (this.props.valueChangeOnBlur !== true) {
      if (this.props.onChange != null && this.props.onChange != undefined)
        this.props.onChange(event);
    } else {
      console.log("InputTexBox : onChange -> Target Value : ", event.target.value);
      this.setState({ textValue: event.target.value });
    }
  };
  */

  /*
  if (props.lookupRequired === true) {
    console.log("Lookup Is Requred!");
  } else {
    console.log("Lookup Is NOT Requred!");
  }
 let children = <div />;
  */

  lookupValueSelected = async (selectedValue) => {
    await this.setState({ textValue: selectedValue });
    this.lookupRef.current.closeLookup();

    /*
    let event = new Event("change");
    let eventTarget = new EventTarget(this.props.name);
    eventTarget.name = this.props.name;
    eventTarget.value = selectedValue;
    eventTarget.dispatchEvent(event);
    this.props.onChange(event);
    */

    if (
      this.props.displayAutoCompleteList != null &&
      this.props.displayAutoCompleteList != undefined
    ) {
      this.props.displayAutoCompleteList(false);
    }
    let tempEventObejct = customEventObject(this.props.name, selectedValue);
    if (
      this.props.onValueChangeOnBlur != null &&
      this.props.onValueChangeOnBlur != undefined
    )
      this.props.onValueChangeOnBlur(tempEventObejct);

    if (this.props.onChange != null && this.props.onChange != undefined)
      this.props.onChange(tempEventObejct);
    if (this.props.selectButtonClick != null) {
      this.props.selectButtonClick();
    }
    setTimeout(() => {
      this.focus();
      focusNextElement();
    }, 100);

    let event = new Event("change");
    let eventTarget = new EventTarget(this.props.name);
    eventTarget.name = this.props.name;
    eventTarget.value = selectedValue;
    eventTarget.dispatchEvent(event);
    if (
      this.props.enterKeyEventHandler != null &&
      this.props.enterKeyEventHandler != undefined
    ) {
      this.props.enterKeyEventHandler(event);
    }
    /*
    let targetFieldName = event.target.name;
    let code = currentRow.code;

    let t = { name: targetFieldName, value: code };
    let e = { target: t };
    this.props.enterKeyEventHandler(e);
*/
  };

  onAutoCompleteLiClick = (event) => {
    let code = event.target.getAttribute("code");
    alert("Onclick" + code);
    console.log("onAutoCompleteLiClick **:", event);
    let targetFieldName = event.target.name;
    let t = { name: targetFieldName, value: code };
    let target = { target: t };

    this.props.enterKeyEventHandler(target);
    setTimeout(() => {
      this.focus();
      focusNextElement();
    }, 100);
    //this.setState({activeSuggestion:0});

    //this.setState({showSuggestions:false});
    /*
  this.setState({
    activeSuggestion: 0,
  userInput: e
  });
  */
  };

  render() {
    let activeSuggestion = this.state.activeSuggestion;
    let showSuggestions = this.props.showAutoCompleteList;

    let suggestionsListComponent;
    if (
      !isEmpty(this.props.autoCompleteListData) &&
      this.props.autoCompleteListData != undefined &&
      showSuggestions
    ) {
      suggestionsListComponent = (
        <ul className="autoCompleteOptions">
          {this.props.autoCompleteListData.map((option, index) => {
            let className;
            if (index === activeSuggestion) {
              className = "suggestion-active";
            }
            return (
              <li
                ref={this.myRef}
                id={"row-" + index}
                className={className}
                key={option.code}
                onClick={this.onAutoCompleteLiClick}
                code={option.code}
                onMouseDown={this.onAutoCompleteLiClick}
              >
                {option.code + "-" + option.description}
              </li>
            );
          })}
        </ul>
      );
    }

    let disabled = false;
    if (this.state.isDisabled !== true) {
      if (this.props.disabled == "" || this.props.disabled == null) {
        disabled = this.props.readOnly;
       
      } else {
        disabled = this.props.disabled;
       
      }
    } else {
      disabled = this.state.isDisabled;
   }

    return (
      <div className="text-box-container">
      <FormControl
          ref={this.componentRef}
          type="text"
          {...this.props}
          value={this.state.textValue}
          //value={this.state.userInput}
          onKeyDown={this.handleKeyDown}
          //onClick={this.onClick}
          onFocus={this.handleFocus}
          onBlur={this.onBlur}
          readOnly={disabled}
          disabled={disabled}
        />
	
        {this.props.enableAutoCompleteTextBox === true &&
        this.props.autoCompleteListData != null &&
        showSuggestions === true
          ? suggestionsListComponent
          : null}
        {this.props.enableAutoComplete === true ? (
          <Button
            tabIndex={-1}
            onClick={this.handleLookup}
            disabled={this.state.isDisabled}
          >
            <SearchImageIcon />
          </Button>
        ) : null}
        {this.props.lookupRequired === true ? (
          <Button
            tabIndex={-1}
            onClick={this.handleLookup}
            disabled={this.state.isDisabled}
          >
            <SearchImageIcon />
          </Button>
        ) : null}
        {!!this.props.lookupHandler ? (
          <LookupDialog
            tabIndex={-1}
            //popupLvlClass={"popupSizeLevel4"}
            lookupHandler={this.props.lookupHandler}
            onLookupValueSelected={this.lookupValueSelected}
            value={this.state.textValue}
            ref={this.lookupRef}
          />
        ) : null}
        {/* {this.props.enableAutoComplete === true ? (
          <Button
            tabIndex={-1}
            onClick={this.handleLookup}
            disabled={this.state.isDisabled}
          >
            <SearchImageIcon />
          </Button>
        ) : null} */}
      </div>
    );
  }
}

class InputTextbox_bkup_16Jun2022 extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.lookupRef = React.createRef();
    this.componentRef = React.createRef();
    this.state = { textValue: this.props.value };
    this.state = { isReadOnly: this.props.readOnly };
    if (this.props.disabled == " " || this.props.disabled == null) {
      this.state = { isDisabled: this.props.readOnly };
    } else {
      this.state = { isDisabled: this.props.disabled };
    }
    this.state = {
      currentRowIndex: 0,
      activeSuggestion: 0,
      showSuggestions: true,
    };
  }

  componentDidUpdate() {
    if (this.props.value !== this.state.textValue)
      this.setState({ textValue: this.props.value });
  }

  componentDidMount() {
    this.modifyTextBox();
    if (this.props.value !== this.state.textValue)
      this.setState({ textValue: this.props.value });
  }

  modifyTextBox = () => {
    if (this.props.isModifyView != null) {
      if (this.props.isModifyView) {
        if (this.props.isModifyEditable != null) {
          if (this.props.isModifyEditable) {
            this.setState({
              isReadOnly: this.props.isModifyEditable,
              isDisabled: this.props.isModifyEditable,
            });
          } else {
            this.setState({
              //isReadOnly: !this.props.isModifyView,
              isDisabled: !this.props.isModifyView,
              isReadOnly: !this.props.isModifyView,
            });
          }
        } else {
          this.setState({
            //isReadOnly: !this.props.isModifyView,
            isDisabled: !this.props.isModifyView,
            isReadOnly: !this.props.isModifyView,
          });
        }
      } else {
        if (this.props.isModifyEditable != null) {
          this.setState({
            isReadOnly: this.props.isModifyEditable,
            isDisabled: this.props.isModifyEditable,
          });
        }
      }
    }
    // console.log("isReadOnly", this.state.isReadOnly);
    // console.log("isDisabled", this.state.isDisabled);
  };

  clear() {
    this.setState({ textValue: "" });
  }

  handleFocus = (event) => {
    //event.target.select();

    if (
      this.props.enableAutoCompleteTextBox === true &&
      this.props.enableAutoCompleteTextBox != undefined
    ) {
      this.props.displayAutoCompleteList(true);
      this.setState({ activeSuggestion: 0 });
    }
    this.componentRef.current.select();
  };

  focus = () => {
    this.componentRef.current.focus();
  };

  handleKeyDown = (event) => {
    //console.log("A key was pressed[keydown]", event.keyCode);
    const { showAutoCompleteList } = this.props;

    if (event.keyCode == 13) {
      //focusNextElement();
      if (
        this.props.enableAutoCompleteTextBox === true &&
        this.props.autoCompleteListData != null &&
        showAutoCompleteList === true
      ) {
        let dataList = this.props.autoCompleteListData;
        let currentRow = dataList[this.state.currentRowIndex];

        if (
          this.props.enterKeyEventHandler &&
          currentRow != undefined &&
          currentRow != null
        ) {
          let targetFieldName = event.target.name;
          let code = currentRow.code;

          let t = { name: targetFieldName, value: code };
          let e = { target: t };
          this.props.enterKeyEventHandler(e);

          this.setState({ activeSuggestion: 0 });
          //focusNextElement();
        }
      } else {
        if (this.props.enterKeyEventHandler) {
          this.props.enterKeyEventHandler(event);
          //return;
        }
        //focusNextElement();
      }
      //console.log("Enter Key is Pressed!", event.keyCode);
      //this.setState({showSuggestions:false});

      setTimeout(() => {
        this.focus();
        focusNextElement();
      }, 100);
      this.componentRef.current.blur();
    }

    if (event.keyCode == 113) {
      if (this.props.lookupRequired === true) {
        this.handleLookup();
        //PopupWindow
      }
    }

    // up key for autocomplete
    //if(this.props.enableAutoCompleteTextBox === true && this.props.autoCompleteListData != null  && displayAutoCompleteList ===  true){
    if (
      this.props.enableAutoCompleteTextBox === true &&
      showAutoCompleteList === true
    ) {
      if (event.keyCode === 38) {
        //up key
        let currentRowIndex = this.state.currentRowIndex - 1;
        let dataList = this.props.autoCompleteListData;
        if (dataList) {
          if (currentRowIndex < 0) {
            currentRowIndex = dataList.length - 1;
            if (currentRowIndex < 0) currentRowIndex = 0;
          }
        } else {
          currentRowIndex = 0;
        }
        this.setState({ currentRowIndex: currentRowIndex });
        this.scrollToRow(currentRowIndex);
        event.preventDefault();
        this.setState({ activeSuggestion: currentRowIndex });
      }

      if (event.keyCode === 40) {
        //down key
        let currentRowIndex = this.state.currentRowIndex + 1;
        let dataList = this.props.autoCompleteListData;
        if (dataList) {
          if (currentRowIndex >= dataList.length) {
            currentRowIndex = 0;
          }
        } else {
          currentRowIndex = 0;
        }
        this.setState({ currentRowIndex: currentRowIndex });
        this.scrollToRow(currentRowIndex);
        event.preventDefault();
        this.setState({ activeSuggestion: currentRowIndex });
      }
    }

    let isCustomHandledKeyDown = this.props.isCustomHandledKeyDown;
    if (isCustomHandledKeyDown) {
      this.props.customeOnKeyDown(event);
    }

    //focusNextElement();
  };

  scrollToRow = (currentRowIndex) => {
    let rowId = "row-" + currentRowIndex;
    //console.log("rowid" , rowId);
    scrollToElement(rowId);
    //this.current.scrollIntoView(false);
    /*
    let divNode = ReactDOM.findDOMNode(rowId);
    //console.log(divNode);
    if (divNode) {
      //console.log(divNode);
      divNode.scrollIntoView();
    }
    */
  };

  handleLookup = () => {
    //let content = <div>This is Handle Lookup!</div>;
    //this.popup_ref.current.showPopup(content);
    this.lookupRef.current.showLookup();
  };

  onBlur = (event) => {
    //if (this.props.onBlur != null && this.props.onBlur != undefined)
    //this.props.onBlur(event);
    if (this.props.valueChangeOnBlur == true) {
      let tempEventObejct = customEventObject(
        this.props.name,
        this.state.textValue
      );
      if (
        this.props.onValueChangeOnBlur != null &&
        this.props.onValueChangeOnBlur != undefined
      )
        this.props.onValueChangeOnBlur(tempEventObejct);
    }
    if (
      this.props.enableAutoCompleteTextBox === true &&
      this.props.enableAutoCompleteTextBox != undefined
    ) {
      setTimeout(() => {
        this.props.displayAutoCompleteList(false);
      }, 100);
      this.setState({ activeSuggestion: 0, currentRowIndex: 0 });
      //this.props.displayAutoCompleteList(false);
    }
  };

  /*
  onChange = (event) => {
    if (this.props.valueChangeOnBlur !== true) {
      if (this.props.onChange != null && this.props.onChange != undefined)
        this.props.onChange(event);
    } else {
      console.log("InputTexBox : onChange -> Target Value : ", event.target.value);
      this.setState({ textValue: event.target.value });
    }
  };
  */

  /*
  if (props.lookupRequired === true) {
    console.log("Lookup Is Requred!");
  } else {
    console.log("Lookup Is NOT Requred!");
  }
 let children = <div />;
  */

  lookupValueSelected = async (selectedValue) => {
    await this.setState({ textValue: selectedValue });
    this.lookupRef.current.closeLookup();

    /*
    let event = new Event("change");
    let eventTarget = new EventTarget(this.props.name);
    eventTarget.name = this.props.name;
    eventTarget.value = selectedValue;
    eventTarget.dispatchEvent(event);
    this.props.onChange(event);
    */

    //this.props.displayAutoCompleteList(false);
    if (
      this.props.displayAutoCompleteList != null &&
      this.props.displayAutoCompleteList != undefined
    ) {
      this.props.displayAutoCompleteList(false);
    }

    let tempEventObejct = customEventObject(this.props.name, selectedValue);
    if (
      this.props.onValueChangeOnBlur != null &&
      this.props.onValueChangeOnBlur != undefined
    )
      this.props.onValueChangeOnBlur(tempEventObejct);

    if (this.props.onChange != null && this.props.onChange != undefined)
      this.props.onChange(tempEventObejct);
    if (this.props.selectButtonClick != null) {
      this.props.selectButtonClick();
    }
    setTimeout(() => {
      this.focus();
      focusNextElement();
    }, 100);

    /*
    let targetFieldName = event.target.name;
    let code = currentRow.code;

    let t = { name: targetFieldName, value: code };
    let e = { target: t };
    this.props.enterKeyEventHandler(e);
*/

    let event = new Event("change");
    let eventTarget = new EventTarget(this.props.name);
    eventTarget.name = this.props.name;
    eventTarget.value = selectedValue;
    eventTarget.dispatchEvent(event);
    if (this.props.enterKeyEventHandler) this.props.enterKeyEventHandler(event);
  };

  onAutoCompleteLiClick = (event) => {
    let code = event.target.getAttribute("code");

    let targetFieldName = event.target.name;
    let t = { name: targetFieldName, value: code };
    let target = { target: t };

    this.props.enterKeyEventHandler(target);
    setTimeout(() => {
      this.focus();
      focusNextElement();
    }, 100);
    //this.setState({activeSuggestion:0});

    //this.setState({showSuggestions:false});
    /*
  this.setState({
    activeSuggestion: 0,
  userInput: e
  });
  */
  };

  render() {
    let activeSuggestion = this.state.activeSuggestion;
    let showSuggestions = this.props.showAutoCompleteList;

    let suggestionsListComponent;
    if (
      !isEmpty(this.props.autoCompleteListData) &&
      this.props.autoCompleteListData != undefined &&
      showSuggestions
    ) {
      suggestionsListComponent = (
        <ul className="autoCompleteOptions">
          {this.props.autoCompleteListData.map((option, index) => {
            let className;
            if (index === activeSuggestion) {
              className = "suggestion-active";
            }
            return (
              <li
                ref={this.myRef}
                id={"row-" + index}
                className={className}
                key={option.code}
                onClick={this.onAutoCompleteLiClick}
                code={option.code}
              >
                {option.code + "-" + option.description}
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <div className="text-box-container">
        <FormControl
          ref={this.componentRef}
          type="text"
          {...this.props}
          value={this.state.textValue}
          //value={this.state.userInput}
          onKeyDown={this.handleKeyDown}
          //onClick={this.onClick}
          onFocus={this.handleFocus}
          onBlur={this.onBlur}
          readOnly={this.state.isReadOnly}
          disabled={this.state.isDisabled}
          autoComplete="off"
        />
        {this.props.enableAutoCompleteTextBox === true &&
        this.props.autoCompleteListData != null &&
        showSuggestions === true
          ? suggestionsListComponent
          : null}
        {this.props.enableAutoComplete === true ? (
          <Button
            tabIndex={-1}
            onClick={this.handleLookup}
            disabled={this.state.isDisabled}
          >
            <SearchImageIcon />
          </Button>
        ) : null}
        {this.props.lookupRequired === true ? (
          <Button
            tabIndex={-1}
            onClick={this.handleLookup}
            disabled={this.state.isDisabled}
          >
            <SearchImageIcon />
          </Button>
        ) : null}
        {!!this.props.lookupHandler ? (
          <LookupDialog
            tabIndex={-1}
            lookupHandler={this.props.lookupHandler}
            onLookupValueSelected={this.lookupValueSelected}
            value={this.state.textValue}
            ref={this.lookupRef}
          />
        ) : null}
        {/* {this.props.enableAutoComplete === true ? (
          <Button
            tabIndex={-1}
            onClick={this.handleLookup}
            disabled={this.state.isDisabled}
          >
            <SearchImageIcon />
          </Button>
        ) : null} */}
      </div>
    );
  }
}

class InputCheckbox_bkup_12Dec2021 extends React.Component {
  constructor(props) {
    super(props);
    this.lookupRef = React.createRef();
    this.componentRef = React.createRef();
    this.state = { checked: this.props.checked };
  }

  componentDidUpdate() {
    //if (this.props.checked !== this.state.checked)
    //this.setState({ checked: this.props.checked });
  }

  handleFocus = (event) => {
    event.target.select();
  };

  handleKeyDown = (event) => {
    if (event.keyCode == 13) {
      //console.log("Enter Key is Pressed!", event.keyCode);
      focusNextElement();
    }
  };

  handleOnChange = (event) => {
    let isChecked = event.target.checked;
    this.setState({ checked: isChecked });

    let tempEventObejct = customEventObject(this.props.name, isChecked);
    this.props.onChange(tempEventObejct);
  };

  render() {
    return (
      <>
        {this.props.lable && (
          <label className="col-sm-12">{this.props.lable}</label>
        )}
        <FormCheck
          className="form-check"
          type="checkBox"
          {...this.props}
          checked={this.state.checked}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
          onChange={this.handleOnChange}
          disabled={this.props.disabled}
        />
      </>
    );
  }
}

class InputTextbox_bkup_11May2022 extends React.Component {
  constructor(props) {
    super(props);
    this.lookupRef = React.createRef();
    this.componentRef = React.createRef();
    this.state = { textValue: this.props.value };
    this.state = { isReadOnly: this.props.readOnly };
    if (this.props.disabled == " " || this.props.disabled == null) {
      this.state = { isDisabled: this.props.readOnly };
    } else {
      this.state = { isDisabled: this.props.disabled };
    }
  }

  componentDidUpdate() {
    if (this.props.checked !== this.state.checked) {
      if (this.props.checked == true) {
        this.setState({
          label: "Yes",
        });
      } else {
        this.setState({
          label: "No",
        });
      }
      this.setState({ checked: this.props.checked });
    }
  }

  componentDidMount() {
    this.modifyTextBox();
    if (this.props.value !== this.state.textValue)
      this.setState({ textValue: this.props.value });
  }

  modifyTextBox = () => {
    if (this.props.isModifyView != null) {
      if (this.props.isModifyView) {
        if (this.props.isModifyEditable != null) {
          if (this.props.isModifyEditable) {
            this.setState({
              isReadOnly: this.props.isModifyEditable,
              isDisabled: this.props.isModifyEditable,
            });
          } else {
            this.setState({
              //isReadOnly: !this.props.isModifyView,
              isDisabled: !this.props.isModifyView,
              isReadOnly: !this.props.isModifyView,
            });
          }
        } else {
          this.setState({
            //isReadOnly: !this.props.isModifyView,
            isDisabled: !this.props.isModifyView,
            isReadOnly: !this.props.isModifyView,
          });
        }
      } else {
        if (this.props.isModifyEditable != null) {
          this.setState({
            isReadOnly: this.props.isModifyEditable,
            isDisabled: this.props.isModifyEditable,
          });
        }
      }
    }
    // console.log("isReadOnly", this.state.isReadOnly);
    // console.log("isDisabled", this.state.isDisabled);
  };

  clear() {
    this.setState({ textValue: "" });
  }

  handleFocus = (event) => {
    //event.target.select();
    this.componentRef.current.select();
  };

  focus = () => {
    this.componentRef.current.focus();
  };

  handleKeyDown = (event) => {
    //console.log("A key was pressed[keydown]", event.keyCode);

    if (event.keyCode == 13) {
      if (this.props.enterKeyEventHandler) {
        this.props.enterKeyEventHandler(event);
        return;
      }
      //console.log("Enter Key is Pressed!", event.keyCode);
      focusNextElement();
      this.componentRef.current.blur();
    }

    if (event.keyCode == 113) {
      if (this.props.lookupRequired === true) {
        this.handleLookup();
        //PopupWindow
      }
    }

    let isCustomHandledKeyDown = this.props.isCustomHandledKeyDown;
    if (isCustomHandledKeyDown) {
      this.props.customeOnKeyDown(event);
    }

    //focusNextElement();
  };

  handleLookup = () => {
    //let content = <div>This is Handle Lookup!</div>;
    //this.popup_ref.current.showPopup(content);
    this.lookupRef.current.showLookup();
  };

  onBlur = (event) => {
    //if (this.props.onBlur != null && this.props.onBlur != undefined)
    //this.props.onBlur(event);
    if (this.props.valueChangeOnBlur == true) {
      let tempEventObejct = customEventObject(
        this.props.name,
        this.state.textValue
      );
      if (
        this.props.onValueChangeOnBlur != null &&
        this.props.onValueChangeOnBlur != undefined
      )
        this.props.onValueChangeOnBlur(tempEventObejct);
    }
  };

  /*
  onChange = (event) => {
    if (this.props.valueChangeOnBlur !== true) {
      if (this.props.onChange != null && this.props.onChange != undefined)
        this.props.onChange(event);
    } else {
      console.log("InputTexBox : onChange -> Target Value : ", event.target.value);
      this.setState({ textValue: event.target.value });
    }
  };
  */

  /*
  if (props.lookupRequired === true) {
    console.log("Lookup Is Requred!");
  } else {
    console.log("Lookup Is NOT Requred!");
  }
 let children = <div />;
  */

  lookupValueSelected = async (selectedValue) => {
    await this.setState({ textValue: selectedValue });
    this.lookupRef.current.closeLookup();

    /*
    let event = new Event("change");
    let eventTarget = new EventTarget(this.props.name);
    eventTarget.name = this.props.name;
    eventTarget.value = selectedValue;
    eventTarget.dispatchEvent(event);
    this.props.onChange(event);
    */

    let tempEventObejct = customEventObject(this.props.name, selectedValue);
    if (
      this.props.onValueChangeOnBlur != null &&
      this.props.onValueChangeOnBlur != undefined
    )
      this.props.onValueChangeOnBlur(tempEventObejct);

    if (this.props.onChange != null && this.props.onChange != undefined)
      this.props.onChange(tempEventObejct);
    if (this.props.selectButtonClick != null) {
      this.props.selectButtonClick();
    }
    setTimeout(() => {
      this.focus();
      focusNextElement();
    }, 100);
  };

  render() {
    //    console.log(
    //    "Render : " + this.props.name,
    //  " Value : " + this.props.value,
    //" Default Value : " + this.props.defaultValue
    //);
    //if (this.props.lookupRequired)
    //console.log("Lookup Handler ", this.props.lookupHandler);
    return (
      <div className="text-box-container">
        <FormControl
          ref={this.componentRef}
          type="text"
          {...this.props}
          value={this.state.textValue}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
          onBlur={this.onBlur}
          readOnly={this.state.isReadOnly}
          disabled={this.state.isDisabled}
        />
        {this.props.lookupRequired === true ? (
          <Button
            tabIndex={-1}
            onClick={this.handleLookup}
            disabled={this.state.isDisabled}
          >
            <SearchImageIcon />
          </Button>
        ) : null}
        {!!this.props.lookupHandler ? (
          <LookupDialog
            tabIndex={-1}
            lookupHandler={this.props.lookupHandler}
            onLookupValueSelected={this.lookupValueSelected}
            value={this.state.textValue}
            ref={this.lookupRef}
          />
        ) : null}
        {this.props.enableAutoComplete === true ? (
          <Button
            tabIndex={-1}
            onClick={this.handleLookup}
            disabled={this.state.isDisabled}
          >
            <SearchImageIcon />
          </Button>
        ) : null}
      </div>
    );
  }
}

class InputNumberTextbox extends React.Component {
  constructor(props) {
    super(props);
    this.lookupRef = React.createRef();
    this.componentRef = React.createRef();
    this.state = { textValue: this.props.value };
  }

  componentDidUpdate() {
    if (this.props.value !== this.state.textValue)
      this.setState({ textValue: this.props.value });
  }

  handleFocus = (event) => {
    event.target.select();
  };

  focus = () => {
    this.componentRef.current.focus();
  };

  handleKeyDown = (event) => {
    if (event.keyCode == 13) {
      //console.log("Enter Key is Pressed!", event.keyCode);
      focusNextElement();
    }
    if (event.keyCode == 113) {
      if (this.props.lookupRequired === true) {
        this.handleLookup();
      }
    }
    let isCustomHandledKeyDown = this.props.isCustomHandledKeyDown;
    if (isCustomHandledKeyDown) {
      this.props.customeOnKeyDown(event);
    }
  };

  handleLookup = () => {
    this.lookupRef.current.showLookup();
  };

  lookupValueSelected = async (selectedValue) => {
    await this.setState({ textValue: selectedValue });
    this.lookupRef.current.closeLookup();

    let tempEventObejct = customEventObject(this.props.name, selectedValue);
    this.props.onChange(tempEventObejct);
  };

  onBlur = (event) => {
    if (this.props.onBlur != null && this.props.onBlur != undefined)
      this.props.onBlur(event);
  };

  render() {
    return (
      <div className="text-box-container">
        <input
          type="text"
          pattern="[0-9]*"
          ref={this.componentRef}
          {...this.props}
          value={this.state.textValue}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
          onBlur={this.onBlur}
        />
      </div>
    );
  }
}

export class AutoCompleteTextbox extends React.Component {
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
    this.state = { textValue: this.props.value };
  }

  clear = () => {
    this.componentRef.current.clear();
    this.setState({ textValue: "" });
  };

  focus = () => {
    this.componentRef.current.focus();
  };

  handleKeyDown = (event) => {
    let isCustomHandledKeyDown = this.props.isCustomHandledKeyDown;
    if (isCustomHandledKeyDown) {
      this.props.customeOnKeyDown(event);
    } else {
      if (event.keyCode == 13) {
        //console.log("Enter Key is Pressed!", event.keyCode);
        focusNextElement();
        this.componentRef.current.blur();
      }
    }
    //focusNextElement();
  };

  onBlur = (event) => {
    if (this.props.onBlur != null && this.props.onBlur != undefined)
      this.props.onBlur(event);
  };

  componentDidUpdate = () => {
    let defaultValue = this.props.defaultValue;
    let selectedValue = [];
    if (!!defaultValue) {
      if (!!this.props.lookupValues && this.props.lookupValues.size > 0) {
        selectedValue = this.props.lookupValues.filter(
          (ent) => ent[this.props.valuePropery] === defaultValue
        );
      } else {
        let tempObj = {};
        tempObj[this.props.valuePropery] = defaultValue;
        tempObj[this.props.descriptionProperty] = defaultValue;
        selectedValue.push(tempObj);
      }
      this.state.textValue = selectedValue;
      this.componentRef.current.blur();
    } else {
      //
    }
  };

  componentDidMount = () => {
    let defaultValue = this.props.defaultValue;
    let selectedValue = [];

    //console.log(
    //"AutoComplete : Default Value : " + this.props.valuePropery + " : ",
    //defaultValue
    //);

    if (!!defaultValue && !!this.props.lookupValues) {
      selectedValue = this.props.lookupValues.filter(
        (ent) => ent[this.props.valuePropery] === defaultValue
      );
      //textValue = selectedValue[0][this.props.valuePropery];
      //console.log(this.props.name, " Selected : ", selectedValue);
    }
    this.setState({ textValue: selectedValue });
  };

  componentDidMount_bkup_10Mar2021 = () => {
    let defaultValue = this.props.defaultValue;
    let selectedValue = [];

    //console.log(
    //"AutoComplete : Default Value : " + this.props.valuePropery + " : ",
    //defaultValue
    //);

    if (!!defaultValue && !!this.props.lookupValues) {
      selectedValue = this.props.lookupValues.filter(
        (ent) => ent[this.props.valuePropery] === defaultValue
      );
      //textValue = selectedValue[0][this.props.valuePropery];
      //console.log(this.props.name, " Selected : ", selectedValue);
    }
    this.setState({ textValue: selectedValue });
  };

  valueSelected = async (selectedValue) => {
    //console.log("AutocompleteBox:  Value Selected :", selectedValue);
    let textValue = "";
    if (!!selectedValue) {
      if (selectedValue.length > 0) {
        textValue = selectedValue[0][this.props.valuePropery];
      }
    }
    await this.setState({ textValue: selectedValue });

    let tempEventObejct = customEventObject(this.props.name, textValue);
    this.props.onChange(tempEventObejct);
  };

  autoCompleteDefaultMenuRender = (option) => {
    return (
      <div>
        <span>{option[this.props.valuePropery]}</span>
        <span>
          <small> | {option[this.props.descriptionProperty]}</small>{" "}
        </span>
      </div>
    );
  };

  filterByFields = [this.props.valuePropery, this.props.descriptionProperty];
  render() {
    return (
      <Typeahead
        align="left"
        ref={this.componentRef}
        filterBy={this.filterByFields}
        id="id1"
        name={this.props.name}
        labelKey={this.props.valuePropery}
        onChange={this.valueSelected}
        options={this.props.lookupValues}
        placeholder={this.props.placeholder}
        selected={this.state.textValue}
        readOnly={this.props.readOnly}
        onKeyDown={this.handleKeyDown}
        onBlur={this.onBlur}
        disabled={this.props.disabled}
        renderMenuItemChildren={(option) => (
          <div className="autocomplete-menu-item">
            <div className="autocomplete-menu-item-value">
              {option[this.props.valuePropery]}
            </div>
            <div className="autocomplete-menu-item-description">
              {option[this.props.descriptionProperty]}
            </div>
          </div>
        )}
      />
    );
  }
}

export class DynamicAutoCompleteTextbox extends React.Component {
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
    this.state = {
      selectedValue: this.props.value,
    };
  }

  handleKeyDown = (event) => {
    let isCustomHandledKeyDown = this.props.isCustomHandledKeyDown;
    event.persist();
    if (isCustomHandledKeyDown) {
      this.props.customeOnKeyDown(event);
    } else {
      if (event.keyCode == 13) {
        //console.log("Enter Key is Pressed!", event.keyCode);
        //alert("Enter Key is Pressed!", event.keyCode);
        focusNextElement();
        this.componentRef.current.blur();
      }
    }
    //focusNextElement();
  };

  componentDidMount = () => {
    let defaultValue = this.props.defaultValue;
    let selectedValue = [];
    if (!!defaultValue) {
      if (!!this.props.lookupValues && this.props.lookupValues.size > 0) {
        selectedValue = this.props.lookupValues.filter(
          (ent) => ent[this.props.valuePropery] === defaultValue
        );
        //console.log("componentDidMount : PropLookup Values Available!");
      } else {
        let tempObj = {};
        tempObj[this.props.valuePropery] = defaultValue;
        tempObj[this.props.descriptionProperty] = defaultValue;
        selectedValue.push(tempObj);

        //let tempLookupValues = [];
        //tempLookupValues.push(tempObj);
        //this.setState({ tempLookupValues: tempLookupValues });
        //console.log("componentDidMount : tempLookupValues Set!");
      }
      this.setState({ selectedValue: selectedValue });
    } else {
      //
    }
  };

  componentDidUpdate = () => {
    let defaultValue = this.props.defaultValue;
    console.log("this.props.isResetValues : ", this.props.isResetValues);
    if (this.props.isResetValues) {
      this.componentRef.current.clear();
      this.state.selectedValue = [];
    }

    let selectedValue = [];

    if (this.props.isResetValues) {
      this.componentRef.current.clear();
      this.state.selectedValue = [];
    }

    if (!!defaultValue) {
      if (!!this.props.lookupValues && this.props.lookupValues.size > 0) {
        selectedValue = this.props.lookupValues.filter(
          (ent) => ent[this.props.valuePropery] === defaultValue
        );
      } else {
        let tempObj = {};
        tempObj[this.props.valuePropery] = defaultValue;
        tempObj[this.props.descriptionProperty] = defaultValue;
        selectedValue.push(tempObj);
      }
      this.state.selectedValue = selectedValue;
      this.componentRef.current.blur();
    } else {
      //
    }
  };

  clearValue = () => {
    this.setState({ selectedValue: [] });
  };

  focus = () => {
    this.componentRef.current.focus();
    // this.valueSelected(this.props.defaultValue);
  };

  valueSelected = async (selectedValue) => {
    let textValue = "";
    if (!!selectedValue) {
      if (selectedValue.length > 0) {
        textValue = selectedValue[0][this.props.valuePropery];
      }
    }
    await this.setState({ selectedValue: selectedValue });

    let tempEventObejct = customEventObject(this.props.name, textValue);
    this.props.onChange(tempEventObejct);
  };

  filterBy = () => true;

  render() {
    let defaultValue = this.props.defaultValue;
    let lookuValues = this.props.lookupValues;
    /*
    if (!!defaultValue) {
      if (!!this.props.lookupValues && this.props.lookupValues.size > 0) {
      } else {
        lookuValues = this.state.tempLookupValues;
      }
    }
    */
    /*
    console.log(
      "DynamicAutoComplete : Render : ",
      "LokupValues : ",
      lookuValues,
      "Default Value : ",
      defaultValue,
      "selected Value : ",
      this.state.selectedValue
    );
      */

    return (
      <AsyncTypeahead
        id="id1"
        ref={this.componentRef}
        name={this.props.name}
        minLength={3}
        isLoading={this.props.isLoading}
        onSearch={this.props.handleSearch}
        labelKey={this.props.valuePropery}
        onChange={this.valueSelected}
        options={lookuValues}
        filterBy={this.filterBy}
        placeholder={this.props.placeholder}
        selected={this.state.selectedValue}
        readOnly={this.props.readOnly}
        onKeyDown={this.handleKeyDown}
        disabled={this.props.disabled}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
        //onRowClicked={this.props.onRowClicked}
        renderMenuItemChildren={(option) => (
          <div className="autocomplete-menu-item">
            <div className="autocomplete-menu-item-value">
              {option[this.props.valuePropery]}
            </div>
            <div className="autocomplete-menu-item-description">
              {option[this.props.descriptionProperty]}
            </div>
            {/* <div className="autocomplete-menu-item-additional">
              {option[this.props.additionalProperty1]}
            </div> */}
          </div>
        )}
      />
    );
  }
}

export class DataGrid extends React.Component {
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
  }

  toDataGridColumn = (columnDef) => {
    //console.log("Lookup Column : ", columnDef);
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let isCenter = columnDef.columnAlignment == 2 ? true : false;
    let tableHeaderAlign = "left";
    if (isRight) tableHeaderAlign = "right";
    else if (isCenter) tableHeaderAlign = "center";
    let tempDataGridColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
      minWidth: columnDef.columnMinWidth,
      maxWidth: columnDef.columnMaxWidth,
      tableHeaderAlign: tableHeaderAlign,
    };

    if (columnDef.imageColumn === true) {
      let cellDef = (row) => (
        <img
          src={this.onImageLinkCallBack(columnDef, row)}
          width={50}
          height={30}
          mode="fit"
        />
      );
      tempDataGridColumnDef.cell = cellDef;
    }
    if (columnDef.hyperLinkcolumn === true) {
      //columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <span
          className="dataGridHyperLink"
          data-tag="allowRowEvents"
          onClick={(evt) => this.onHyperLinkClick(evt, columnDef, row)}
        >
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      tempDataGridColumnDef.cell = cellDef;
      tempDataGridColumnDef.ignoreRowClick = true;
    }

    if (columnDef.statusColumn === true) {
      let cellDef = (row) => (
        <span>
          {this.getStatusCaption(
            columnDef,
            row[columnDef.columnBindingPropertyName]
          )}
        </span>
      );
      tempDataGridColumnDef.cell = cellDef;
      tempDataGridColumnDef.ignoreRowClick = true;
    }

    return tempDataGridColumnDef;
  };

  onHyperLinkClick = (e, columnDef, rowData) => {
    //alert("HyperLink Clicked!");
    //console.log(this.componentRef.current);
    //console.log(e);
    //console.log("Row Data", rowData);
    //console.log("target:", e.target);
    if (e && e.target) {
      let selectedValue = e.target.innerText;
      console.log("Hyperlink Clicked  => target:value:", selectedValue);
      if (!!columnDef.hyperLinkCallback) {
        columnDef.hyperLinkCallback(selectedValue, rowData);
      }
    }

    //alert(e);
  };

  onRowClicked = (e) => {
    console.log("Row Clicked :   ", e);
  };

  onImageLinkCallBack = (columnDef, rowData) => {
    if (!!columnDef.imageLinkCallBack) {
      return columnDef.imageLinkCallBack(rowData);
    }
  };

  getStatusCaption = (columnDef, status) => {
    if (!!columnDef.getStatusCaption) {
      let finalStatus = columnDef.getStatusCaption(status);
      return finalStatus;
    }
  };

  render() {
    let dataGridColumnList = [];
    if (this.props.columnsList) {
      //console.log(this.props.columnsList);
      this.props.columnsList.map((cdef) =>
        dataGridColumnList.push(this.toDataGridColumn(cdef))
      );
    }

    let noDataComponent = (
      <DataTableNoDataComponent isLoading={this.props.isLoading} />
    );

    return (
      <DataTable
        customStyles={this.props.styles}
        ref={this.componentRef}
        keys={this.props.keys}
        columns={dataGridColumnList}
        striped={true}
        highlightOnHover={true}
        data={this.props.dataList}
        noDataComponent={noDataComponent}
        onRowClicked={this.onRowClicked}
        persistTableHead
      />
    );
  }
}

export class DataTableNoDataComponent extends React.Component {
  render() {
    let output = "No Data";
    if (this.props.isLoading) {
      output = "Loading... Pleae Wait!";
    }
    return <div className="dataGridNoDataComponent">{output}</div>;
  }
}

export class DataGridColumnDefinition {
  constructor() {
    this.columnDisplayName = "";
    this.columnBindingPropertyName = "";
    // this.sortable = false;
    this.columnAlignment = 0; // 0 -->Left  1-->Right  2-->Center
    this.hyperLinkcolumn = false;
    //this.textBoxColumn = false;
    //this.checkBoxColumn = false;
    this.hyperLinkCallback = null;
    this.imageColumn = false;
    this.imageLinkCallBack = null;
    this.columnMinWidth = "";
    this.columnMaxWidth = "";
    this.inputBoxColumn = false;
    this.inputBoxTargetColumnName = "";
    this.inputChangeCallback = null;
    this.buttonColumn = false;
    this.buttonClickCallback = null;
    this.columnDisabled = false;

    this.checkBoxColumn = false;
    this.checkBoxClickCallback = null;

    this.statusColumn = false;
    this.getStatusCaption = null;

    this.inputBoxOnBlurCallback = null;
  }

  setDetails = (
    columnDisplayName,
    columnBindingPropertyName,
    // sortable = false,
    columnAlignment = 0,
    hyperLinkcolumn = false,
    hyperLinkCallback = null,
    // checkBoxColumn = false,
    //checkBoxClickCallback = null,
    imageColumn = false,
    imageLinkCallBack = null,
    columnMinWidth,
    columnMaxWidth,
    statusColumn = false,
    getStatusCaption = null
  ) => {
    this.columnDisplayName = columnDisplayName;
    this.columnBindingPropertyName = columnBindingPropertyName;
    // this.sortable = sortable;
    this.columnAlignment = columnAlignment;
    this.hyperLinkcolumn = hyperLinkcolumn;
    this.hyperLinkCallback = hyperLinkCallback;
    //  this.checkBoxColumn = checkBoxColumn;
    //this.checkBoxClickCallback = checkBoxClickCallback;
    this.imageColumn = imageColumn;
    this.imageLinkCallBack = imageLinkCallBack;
    this.columnMinWidth = columnMinWidth;
    this.columnMaxWidth = columnMaxWidth;
    this.statusColumn = statusColumn;
    this.getStatusCaption = getStatusCaption;

    return this;
  };

  setEditableDetails = (
    inputBoxColumn = false,
    inputBoxTargetColumnName = "",
    inputChangeCallback = null,
    buttonColumn = false,
    buttonClickCallback = null,
    checkBoxColumn = false,
    checkBoxClickCallback = null,
    inputBoxOnBlurCallback = null
  ) => {
    this.inputBoxColumn = inputBoxColumn;
    this.inputBoxTargetColumnName = inputBoxTargetColumnName;
    this.inputChangeCallback = inputChangeCallback;
    this.buttonColumn = buttonColumn;
    this.buttonClickCallback = buttonClickCallback;
    this.checkBoxColumn = checkBoxColumn;
    this.checkBoxClickCallback = checkBoxClickCallback;
    this.inputBoxOnBlurCallback = inputBoxOnBlurCallback;
    return this;
  };

  setDisabled = (columnDisabled = false) => {
    this.columnDisabled = columnDisabled;
    return this;
  };
}

const CollapseComponent = ({ isOpen, onClick }) => {
  return (
    <Button
      onClick={onClick}
      size="sm"  
      tabindex="-1"
      className="custom_collapsable_button"
    >
      {isOpen ? <CollapseMinimizeIcon /> : <CollapseMaximizeIcon />}
    </Button>
  );
};

class PopupWindow extends React.Component {
  constructor(props) {
    super(props);
    this.skyLightDialogRef = React.createRef();

    this.state = { popupContent: "" };

    this.customStyles = {
      table: {
        style: {
          height: "300px",
          width: "750px",
          ScrollX: false,
          overflow: "auto",
        },
      },
    };
    this.skylightStyles = {
      height: "470px",
      width: "800px",
    };
  }

  showPopup = (popupContent) => {
    this.setState({ popupContent: popupContent });
    this.skyLightDialogRef.current.show();
  };

  render() {
    return (
      <SkyLight
        dialogStyles={this.skylightStyles}
        hideOnOverlayClicked
        ref={this.skyLightDialogRef}
        onCloseClicked={this.props.onCloseClicked}
        title={this.props.title}
      >
        <div>
          {!this.state.popupContent}?{this.state.popupContent}:"";
        </div>
      </SkyLight>
    );
  }
}

export const Lookup = (props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.isShowPopup == false) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  const closeModal = () => {
    props.closeAlertModalCallBack(false);
    setOpen(false);
  };
  return (
    <>
      <div>
        <Popup
          id="searchLookup"
          ref={props.parentRef}
          open={open}
          closeOnDocumentClick={false}
          onClose={closeModal}
          repositionOnResize={true}
          position="center center"
          className="searchLookup"
          nested={true}
          z-index={1000}
        >
          <div className="modal">
            <button className="close" onClick={closeModal}>
              &times;
            </button>

            <div className="moduleContainer" id="moduleContainer">
              <div className="modalHeaderWithButtons">
                <div className="modalButtonContainer modalLeftSideHeader">
                  {props.headerButtonContainer && (
                    <div>{props.headerButtonContainer}</div>
                  )}
                </div>
                <div className="modalTitle">{props.title}</div>
                <div className="modalRightSideHeader"></div>
              </div>
              <div className="content">
                {props.headercontent}
                {props.paginationContent}
                {props.resultContent}
              </div>
            </div>
          </div>
        </Popup>
      </div>
    </>
  );
};

class LookupDialog extends React.Component {
  //resetPaginationToggle: false,
  //filterText:'',
  //currentpage:0,
  //perpage:10,
  //totalRows:0,
  //totalPages:0,
  //alert("LookupDialog");
  static contextType = ApplicationDataContext;
  constructor(props) {
    super(props);

    let tempLookupData = null;
    this.loadDataFromServiceFlag = false;
    if (!!this.props.lookupHandler) {
      tempLookupData = this.props.lookupHandler.lookupdata;
      this.loadDataFromServiceFlag =
        this.props.lookupHandler.lookupDataCallback != null;
    }

    this.paginationFlag = false;
    if (!!this.props.paginationFlag) {
      this.paginationFlag = this.props.paginationFlag;
    }

    this.valueColumnName = "code";

    this.state = {
      filterText: "",
      lookupdata: tempLookupData,
      pageResultDetails: new LookupResultDetails(),
      showDataTable: false,
      showCriteriaView: this.props.lookupHandler.lookupCriteriaView,
      pageList: new PageListBean(),
      searchCriteria: this.props.lookupHandler.lookupCriteria,
      selectedValue: "",
      isCriteriaOpen: false,
      isShowLookup: false,
      value: this.props.value,
      isCriteriaReset: false,
      currentRowIndex: 0,
    };

    this.skyLightDialogRef = React.createRef();
    this.searchCriteriaRef = React.createRef();
    this.criteriaViewRef = React.createRef();
    this.resultGridRef = React.createRef();
  }

  componentDidMount() {
    const appData = this.context;
    this.companyCode = appData.companyCode;

    this._isMounted = true;

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    let currentPage = this.state.pageList.currentPage;
    if (currentPage == null || currentPage <= 0) {
      pageInput.currentPage = 1;
    } else {
      pageInput.currentPage = currentPage;
    }
  }

  componentDidUpdate() {
    // console.log(
    //   "lookupdialog componentDidUpdate is called..!",
    //   this.state.value
    // );
    if (this.props.value !== this.state.value)
      this.setState({ value: this.props.value });
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  updateResultCallBack = (lookup_result_details) => {
    if (this._isMounted) {
      this.setState({
        lookupdata: lookup_result_details.pageData,
        pageResultDetails: lookup_result_details,
        currentRowIndex: 0,
      });
      this.setFocusOnResultGrid();
    }
  };

  setFocusOnResultGrid = () => {
    if (this.resultGridRef.current) this.resultGridRef.current.focus();
  };

  generateLookupColumns = () => {
    let lookupColumnsList = [];
    if (!!this.props.lookupHandler) {
      for (let columnDef of this.props.lookupHandler.lookupColumnDefinitions) {
        lookupColumnsList.push(this.toLookupColumn(columnDef));
      }
    }
    return lookupColumnsList;
  };

  toLookupColumn = (columnDef) => {
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let lookupColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
    };

    if (columnDef.valueColumn === true) {
      this.valueColumnName = columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <span className="lookupLink" onClick={this.valueSelected}>
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      lookupColumnDef.cell = cellDef;
      lookupColumnDef.ignoreRowClick = true;
    }

    return lookupColumnDef;
  };

  valueSelected = (e) => {
    let selectedValue = e.target.innerText;

    if (!!this.props.onLookupValueSelected) {
      this.setState({ selectedValue: selectedValue });
      this.props.onLookupValueSelected(selectedValue);
    }

    //alert(e);
  };

  customStyles = {
    table: {
      style: {
        height: "400px",
        width: "100%",
        ScrollX: false,
        overflow: "auto",
      },
    },
    rows: {
      style: {
        minHeight: "20px",
      },
      highlightOnHoverStyle: {
        backgroundColor: "rgba(140, 140, 140, 0.9)",
        color: "white",
      },
      stripedStyle: {
        color: "#000",
        backgroundColor: "#f9f9f9",
      },
    },
  };

  skylightStyles = {
    dialogStyles: {
      height: "470px",
      width: "800px",
    },
  };

  showLookup = () => {
    console.log("showLookup state value  => ", this.props.value);
    if (this.props.lookupHandler.lookupCriteria) {
      if (this.props.value) {
        let result = this.props.value.toUpperCase();
        if ("NEW" !== result && this.props.value.length >= 3) {
          //console.log("showLookup value length  => ", this.props.value.length);
          this.loadDataFromServiceFlag = false;
          // this.showLookupWithCriteriaAndValue();
        }
        this.setState({
          isShowLookup: true,
          showDataTable: true,
          isCriteriaOpen: true,
        });
      } else {
        // console.log("showLookup state lenght else fn  => ", this.props.value.length);
        this.setState({
          isShowLookup: true,
          showDataTable: true,
          isCriteriaOpen: true,
        });
      }

      setTimeout(() => {
        this.setFocusOnResultGrid();
        if (
          this.props.lookupHandler.lookupCriteriaView &&
          this.searchCriteriaRef.current !== null
        ) {
          if (this.criteriaViewRef.current)
            this.criteriaViewRef.current.focusRef.current.focus();
        }
      }, 500);
    } else {
      console.log("inside else  => ", this.props.value);

      this.showLookupWithCriteriaAndValue();
      this.setState({
        isShowLookup: true,
        showDataTable: true,
        isCriteriaOpen: true,
      });
      setTimeout(() => {
        this.setFocusOnResultGrid();
        if (
          this.props.lookupHandler.lookupCriteriaView &&
          this.searchCriteriaRef.current !== null
        ) {
          if (this.criteriaViewRef.current)
            this.criteriaViewRef.current.focusRef.current.focus();
        }
      }, 500);
    }
  };

  closeLookup = async () => {
    await this.setState({
      showDataTable: false,
      //lookupdata: null,
      filterText: "",
      isShowLookup: false,
      searchCriteria: [],
      lookupdata: this.props.lookupHandler.lookupdata,
    });
  };

  executeFilter = (e) => {
    e.preventDefault();
    let filterText = e.target.value;
    // this.setState({ filterText: filterText });
    this.setState({ filterText: filterText });

    // let criteria = this.state.searchCriteria;
    // if(criteria != null){
    //   if(e.target.name === "filterText"){
    //    criteria[]
    //   }
    // }
    /*
    let user_list = this.state.user_list;
    let newFilterText = e.target.value;
    this.filteredItems = user_list.filter(
      (item) =>
        item.userName &&
        item.userName.toLowerCase().includes(newFilterText.toLowerCase())
    );
    this.setState({ filterText: newFilterText });
    this.setState({ show_list: true });
    this.setState({ show_data: false });
    */
  };

  filterList = (pageNumber) => {
    let criteria = this.state.searchCriteria;
    console.log("criteria :", criteria);
    console.log("cirteria lookup :", this.props.lookupHandler.lookupCriteria);
    let value = this.state.filterText;

    console.log("loadPage criteria =>", value);
    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = pageNumber;
    if (criteria != null) {
      this.showLookupWithPaginationAndCriteria(pageNumber, criteria, value);
    } else {
      this.FilterAttributeList(value);
    }
  };
  FilterAttributeList = (value) => {
    console.log(
      "lookuphandler fetch :",
      this.props.lookupHandler.fetchDataFromService
    );
    console.log("lookuphandler  :", this.props.lookupHandler);
    let lookupDataList = [];
    this.state.lookupdata
      .filter((ft) => ft.code === value || ft.description === value)
      .map((list) => {
        console.log("filter List :", list);
        lookupDataList.push(list);
      });
    console.log("list :", lookupDataList);
    this.setState({ lookupdata: lookupDataList });
  };

  handleClear = () => {
    const { resetPaginationToggle, filterText } = this.state;

    if (this.state.filterText) {
      this.setState({
        resetPaginationToggle: !resetPaginationToggle,
        filterText: "",
      });
    }
  };

  resetFilter = () => {
    this.setState({ filterText: "" });
    let criteria = this.state.searchCriteria;
    if (criteria != null) {
      this.resetCriteria();
    } else {
      let lookupData = this.props.lookupHandler.lookupdata;
      console.log("lookupData :", lookupData);
      this.setState({ lookupdata: lookupData });
    }
  };

  showLookupWithCriteria = (searchCriteria) => {
    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, 0, searchCriteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(
        this,
        0,
        this.props.lookupHandler.lookupCriteria,
        this.state.value
      );
    }
    this.setState({
      isShowLookup: true,
      showDataTable: true,
      criteriaOpen: false,
    });
  };

  showLookupWithCriteriaAndValue = () => {
    console.log("showLookupWithCriteriaAndValue is called");
    console.log(
      "this.state.searchCriteria",
      this.props.lookupHandler.lookupCriteria
    );
    console.log("this.state.value", this.state.value);
    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(
        this,
        0,
        this.props.lookupHandler.lookupCriteria,
        null
      );
      console.log("searchCriteria inside if", this.state.searchCriteria);
      console.log("value inside if", this.state.value);
    } else {
      this.props.lookupHandler.fetchDataFromService(
        this,
        0,
        this.props.lookupHandler.lookupCriteria,
        this.state.value
      );
      // this.searchCriteriaCallBack(this.state.searchCriteria);
      console.log("searchCriteria inside else", this.state.searchCriteria);
      console.log("value inside else", this.state.value);
    }
    this.setState({
      isShowLookup: true,
      showDataTable: true,
      criteriaOpen: false,
    });
  };

  searchCriteriaCallBack = (searchCriteria) => {
    this.setState({ searchCriteria: searchCriteria, isCriteriaOpen: false });
    this.showLookupWithCriteria(searchCriteria);
    // this.showLookupWithCriteriaAndValue();
  };

  renderCriteria = () => {
    const CriteriaView = this.props.lookupHandler.lookupCriteriaView;

    if (CriteriaView !== null && CriteriaView !== undefined) {
      return (
        <Popup
          ref={this.searchCriteriaRef}
          open={this.state.isCriteriaOpen}
          closeOnDocumentClick={false}
          repositionOnResize={true}
          position="center center"
          // className="popupSizeLevel4 criteriaLookup"
          className="criteriaLookup"
          id="criteriaLookup"
          // z-index={1}
        >
          <div className="modal">
            <button className="close" onClick={this.closeCriteriaModal}>
              &times;
            </button>

            <div className="moduleContainer" id="moduleContainer">
              <div className="modalHeaderWithButtons">
                <div className="modalButtonContainer modalLeftSideHeader">
                  {/* {props.headerButtonContainer && (
                    <div>{props.headerButtonContainer}</div>
                  )} */}
                </div>
                <div className="modalTitle">{"Search Criteria"}</div>
                <div className="modalRightSideHeader"></div>
              </div>
              <div className="content">
                {" "}
                <CriteriaView
                  ref={this.criteriaViewRef}
                  searchCriteria={this.state.searchCriteria}
                  searchCriteriaCallBack={this.searchCriteriaCallBack}
                />
              </div>
            </div>
          </div>
        </Popup>
      );
      //
    } else {
      return <></>;
    }
  };

  closeCriteriaModal = () => {
    this.setState({ isCriteriaOpen: false });
  };

  handleAfterClose = () => {
    this.clearLookupData();
    if (this.criteriaViewRef.current)
      this.criteriaViewRef.current.clearCriteria();
  };

  clearLookupData() {
    //for empty the lookup data & set and focus elements

    let emptyArray = new Array();
    this.setState({
      lookupdata: emptyArray,
      showDataTable: false,
    });
    console.log("show lookupdata :", this.state.lookupdata);
  }

  /* pagination */

  showLookupWithPaginationAndCriteria = (pageNumber, criteria, value) => {
    //this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(
        this,
        pageNumber,
        criteria,
        value
      );
    } else {
      this.props.lookupHandler.fetchDataFromService(
        this,
        pageNumber,
        criteria,
        value
      );
    }
    this.setState({
      isShowLookup: true,
      showDataTable: true,
      isCriteriaOpen: false,
    });

    //this.searchCriteriaRef.current.hide();
  };

  loadPage = (pageNumber) => {
    let criteria = this.state.searchCriteria;
    console.log("criteria :", criteria);
    let value = this.state.value;

    console.log("loadPage criteria =>", value);
    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = pageNumber;
    this.showLookupWithPaginationAndCriteria(pageNumber, criteria, value);
  };

  loadFirst = () => {
    this.loadPage(1);
  };
  loadPrevious = () => {
    let currentPage = this.state.pageResultDetails.currentPageNumber;
    let previousPage = currentPage - 1;
    this.loadPage(previousPage);
  };
  loadNext = () => {
    //let currentPage = this.state.pageList.currentPage;
    let currentPage = this.state.pageResultDetails.currentPageNumber;

    let nextPage = currentPage + 1;
    this.loadPage(nextPage);
  };
  loadLast = () => {
    let pageSize = this.state.pageResultDetails.pageSize;
    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let totalPages = totalCount / pageSize;
    totalPages += parseInt(totalCount % pageSize == 0 ? 0 : 1);

    this.loadPage(totalPages);
  };

  resetCriteria = () => {
    let resetCriteriaFromLookupHandler = this.props.lookupHandler.resetCriteria;
    this.setState({
      searchCriteria: resetCriteriaFromLookupHandler,
      //value: "",
    });

    //empty the textbox value

    if (this.criteriaViewRef.current)
      this.criteriaViewRef.current.clearCriteria(); // call the handler function using ref.

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = 1;
    this.showLookupWithPaginationAndCriteria(
      1,
      resetCriteriaFromLookupHandler,
      ""
    );
  };

  conditionalRowStyles = [
    {
      when: (row) => this.checkCurrentRow(row),
      style: {
        backgroundColor: "rgba(140, 140, 140, 0.9)",
        color: "white",
        "&:hover": {
          cursor: "pointer",
        },
      },
    },
  ];

  checkCurrentRow = (row) => {
    let dataList = this.state.lookupdata;
    if (dataList) {
      let currentRow = dataList[this.state.currentRowIndex];
      if (currentRow) {
        return currentRow[this.valueColumnName] == row[this.valueColumnName];
      }
    }
    //this.valueColumnName
    //return row[]
    //console.log(row);
    return false;
  };

  /*
Key	Code
ener key  13
left arrow	37
up arrow	38
right arrow	39
down arrow	40
*/

  resultGridHandleKeyDown = (event) => {
    if (event.keyCode == 13) {
      let dataList = this.state.lookupdata;
      if (dataList) {
        let currentRow = dataList[this.state.currentRowIndex];
        if (currentRow) {
          let selectedValue = currentRow[this.valueColumnName];
          this.props.onLookupValueSelected(selectedValue);
        }
      }
      event.preventDefault();
    } else if (event.keyCode == 38) {
      let currentRowIndex = this.state.currentRowIndex - 1;
      let dataList = this.state.lookupdata;
      if (dataList) {
        if (currentRowIndex < 0) {
          currentRowIndex = dataList.length - 1;
          if (currentRowIndex < 0) currentRowIndex = 0;
        }
      } else {
        currentRowIndex = 0;
      }
      this.setState({ currentRowIndex: currentRowIndex });
      this.scrollToRow(currentRowIndex);
      event.preventDefault();
    } else if (event.keyCode == 40) {
      let currentRowIndex = this.state.currentRowIndex + 1;
      let dataList = this.state.lookupdata;
      console.log("dataList...", dataList);
      if (dataList) {
        if (currentRowIndex >= dataList.length) {
          currentRowIndex = 0;
        }
      } else {
        currentRowIndex = 0;
      }
      this.setState({ currentRowIndex: currentRowIndex });
      this.scrollToRow(currentRowIndex);
      event.preventDefault();
    }
  };

  onRowClicked = (row, event) => {
    let currentRowIndex = this.state.currentRowIndex;
    let dataList = this.state.lookupdata;
    if (dataList) {
      currentRowIndex = this.getRowIndex(dataList, row);
      //console.log("Row : ", row, " Current Row Index : ", currentRowIndex);
      if (currentRowIndex < 0) {
        currentRowIndex = 0;
      }
    }
    this.setState({ currentRowIndex: currentRowIndex });
    //alert("Row Click");
    event.preventDefault();
  };

  onRowDoubleClicked = (row, event) => {
    //alert("Row Click");
    let selectedValue = row[this.valueColumnName];
    if (selectedValue) {
      this.props.onLookupValueSelected(selectedValue);
    }
    event.preventDefault();
  };

  getRowIndex = (dataList, row) => {
    for (let i = 0; i < dataList.length; i++) {
      if (dataList[i][this.valueColumnName] === row[this.valueColumnName]) {
        return i;
      }
    }
    return -1;
  };

  scrollToRow = (currentRowIndex) => {
    let rowId = "row-" + currentRowIndex;
    console.log("rowId...", rowId);
    scrollToElement(rowId);
    /*
    let divNode = ReactDOM.findDOMNode(rowId);
    console.log(divNode);
    if (divNode) {
      console.log(divNode);
      divNode.scrollIntoView();
    }
    */
  };

  searchBarKeyDown = (e) => {
    if (e.keyCode == 13) {
      this.filterList(1);
    }
  };

  //let listcolumns = props.listcolumns;
  render() {
    //alert("LookupDialog");
    //console.log("Lookup dialog : Lookup Handler ", this.props.lookupHandler);
    //console.log("Lookup ShowTableFlag : " + this.state.showDataTable);

    if (!!this.state.lookupHandler) {
      console.log("Lookup Caption : " + this.props.lookupHandler.lookupTitle);
      console.log("Lookup Data : " + this.props.dataList);
      console.log("Lookup Columns : " + this.props.lookupColumnsList);
    }

    let lookupColumnsList = this.generateLookupColumns();
    let dataList = this.state.lookupdata;

    //console.log("datalist render :", dataList);
    // let dataPageList = new Array();
    // if (this.state.pageResultDetails.pageSize) {
    //   dataPageList = this.state.pageResultDetails.pageSize;
    //   console.log("dataPageList.length =>", dataPageList.length);
    // }

    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let currentPageNumber = this.state.pageResultDetails.currentPageNumber;
    let resultPageSize = this.state.pageResultDetails.pageSize;

    let totalPages = 0;
    let pageSize = resultPageSize;
    totalPages = totalCount / pageSize;
    totalPages += totalCount % pageSize == 0 ? 0 : 1;

    return (
      <>
        <MultiViewPopup
          isLookup={true}
          //popupLvlClass={"popupSizeLevel2"}
          ref={this.skyLightDialogRef}
          parentRef={this.skyLightDialogRef}
          isShowPopup={this.state.isShowLookup}
          title={
            !!this.props.lookupHandler
              ? this.props.lookupHandler.lookupTitle
              : ""
          }
          closeAlertModalCallBack={this.closeLookup}
          headercontent={
            this.state.showDataTable && (
              <Container>
                {/* <SkyLight ref={this.searchCriteriaRef} title={"Search Criteria"}> */}
                <div>{this.renderCriteria()}</div>
                {/* </SkyLight> */}
                <Form>
                  <Row>
                    <Col md={1}>
                      <FormLabel>Search</FormLabel>{" "}
                    </Col>
                    <Col md={7}>
                      <InputTextbox
                        id="search"
                        type="text"
                        placeholder="Search"
                        name="filterText"
                        value={this.state.filterText}
                        onChange={this.executeFilter}
                        onKeyDown={this.searchBarKeyDown}
                      />
                    </Col>

                    <Col md={1}>
                      {/* <Button size="sm" onClick={() => this.showLookup()}>
                        {" "}
                        <FilterIcon />
                     </Button>*/}
                      <Button size="sm" onClick={() => this.filterList(1)}>
                        {" "}
                        <FilterIcon />
                      </Button>
                    </Col>

                    <Col md={2}>
                      <Button size="sm" onClick={() => this.resetFilter()}>
                        {" "}
                        Reset
                      </Button>
                    </Col>

                    <Col md={1}>
                      <Button size="sm" onClick={() => this.resetCriteria()}>
                        {" "}
                        <RefreshIcon />
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Container>
            )
          }
          paginationContent={
            <div className="module_header_secondary_buttons">
              <Button
                size="sm"
                className="secondary_header_buttons"
                onClick={() => this.loadFirst()}
              >
                First
              </Button>
              <Button
                size="sm"
                className="secondary_header_buttons"
                onClick={() => this.loadPrevious()}
              >
                Previous
              </Button>
              <span className="black-color-font">
                PAGE - {currentPageNumber} of {parseInt(totalPages)}
              </span>
              <Button
                size="sm"
                className="secondary_header_buttons"
                onClick={() => this.loadNext()}
              >
                Next
              </Button>
              <Button
                size="sm"
                className="secondary_header_buttons"
                onClick={() => this.loadLast()}
              >
                Last
              </Button>
            </div>
          }
          resultContent={
            !!dataList &&
            this.state.showDataTable && (
              <div
                ref={this.resultGridRef}
                onKeyDown={this.resultGridHandleKeyDown}
                tabindex="0"
                class="lookupResultGrid"
              >
                <DataTable
                  keys="user"
                  columns={lookupColumnsList}
                  striped="true"
                  highlightOnHover="false"
                  pointerOnHover="true"
                  customStyles={this.customStyles}
                  data={dataList}
                  onRowClicked={this.onRowClicked}
                  onRowDoubleClicked={this.onRowDoubleClicked}
                  persistTableHead
                  fixedHeader
                  conditionalRowStyles={this.conditionalRowStyles}
                />
              </div>
            )
          }
        />
      </>
    );
  }
}

class LookupDialog_bkup_16Jun2022 extends React.Component {
  //resetPaginationToggle: false,
  //filterText:'',
  //currentpage:0,
  //perpage:10,
  //totalRows:0,
  //totalPages:0,
  static contextType = ApplicationDataContext;
  constructor(props) {
    super(props);

    let tempLookupData = null;
    this.loadDataFromServiceFlag = false;
    if (!!this.props.lookupHandler) {
      tempLookupData = this.props.lookupHandler.lookupdata;
      this.loadDataFromServiceFlag =
        this.props.lookupHandler.lookupDataCallback != null;
    }

    this.paginationFlag = false;
    if (!!this.props.paginationFlag) {
      this.paginationFlag = this.props.paginationFlag;
    }

    this.valueColumnName = "code";

    this.state = {
      filterText: "",
      lookupdata: tempLookupData,
      pageResultDetails: new LookupResultDetails(),
      showDataTable: false,
      showCriteriaView: this.props.lookupHandler.lookupCriteriaView,
      pageList: new PageListBean(),
      searchCriteria: this.props.lookupHandler.lookupCriteria,
      selectedValue: "",
      isCriteriaOpen: false,
      isShowLookup: false,
      value: this.props.value,
      isCriteriaReset: false,
      currentRowIndex: 0,
    };

    this.skyLightDialogRef = React.createRef();
    this.searchCriteriaRef = React.createRef();
    this.criteriaViewRef = React.createRef();
    this.resultGridRef = React.createRef();
  }

  componentDidMount() {
    const appData = this.context;
    this.companyCode = appData.companyCode;

    this._isMounted = true;

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    let currentPage = this.state.pageList.currentPage;
    if (currentPage == null || currentPage <= 0) {
      pageInput.currentPage = 1;
    } else {
      pageInput.currentPage = currentPage;
    }
  }

  componentDidUpdate() {
    // console.log(
    //   "lookupdialog componentDidUpdate is called..!",
    //   this.state.value
    // );
    if (this.props.value !== this.state.value)
      this.setState({ value: this.props.value });
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  updateResultCallBack = (lookup_result_details) => {
    if (this._isMounted) {
      this.setState({
        lookupdata: lookup_result_details.pageData,
        pageResultDetails: lookup_result_details,
        currentRowIndex: 0,
      });
      this.setFocusOnResultGrid();
    }
  };

  setFocusOnResultGrid = () => {
    if (this.resultGridRef.current) this.resultGridRef.current.focus();
  };

  generateLookupColumns = () => {
    let lookupColumnsList = [];
    if (!!this.props.lookupHandler) {
      for (let columnDef of this.props.lookupHandler.lookupColumnDefinitions) {
        lookupColumnsList.push(this.toLookupColumn(columnDef));
      }
    }
    return lookupColumnsList;
  };

  toLookupColumn = (columnDef) => {
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let lookupColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
    };

    if (columnDef.valueColumn === true) {
      this.valueColumnName = columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <span className="lookupLink" onClick={this.valueSelected}>
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      lookupColumnDef.cell = cellDef;
      lookupColumnDef.ignoreRowClick = true;
    }

    return lookupColumnDef;
  };

  valueSelected = (e) => {
    let selectedValue = e.target.innerText;

    if (!!this.props.onLookupValueSelected) {
      this.setState({ selectedValue: selectedValue });
      this.props.onLookupValueSelected(selectedValue);
    }

    //alert(e);
  };

  customStyles = {
    table: {
      style: {
        height: "400px",
        width: "100%",
        ScrollX: false,
        overflow: "auto",
      },
    },
    rows: {
      style: {
        minHeight: "20px",
      },
      highlightOnHoverStyle: {
        backgroundColor: "rgba(140, 140, 140, 0.9)",
        color: "white",
      },
      stripedStyle: {
        color: "#000",
        backgroundColor: "#f9f9f9",
      },
    },
  };

  skylightStyles = {
    dialogStyles: {
      height: "470px",
      width: "800px",
    },
  };

  showLookup = () => {
    console.log("showLookup state value  => ", this.props.value);
    if (this.props.lookupHandler.lookupCriteria) {
      if (this.props.value) {
        let result = this.props.value.toUpperCase();
        if ("NEW" !== result && this.props.value.length >= 3) {
          //console.log("showLookup value length  => ", this.props.value.length);
          this.loadDataFromServiceFlag = false;
          // this.showLookupWithCriteriaAndValue();
        }
        this.setState({
          isShowLookup: true,
          showDataTable: true,
          isCriteriaOpen: true,
        });
      } else {
        // console.log("showLookup state lenght else fn  => ", this.props.value.length);
        this.setState({
          isShowLookup: true,
          showDataTable: true,
          isCriteriaOpen: true,
        });
      }

      setTimeout(() => {
        this.setFocusOnResultGrid();
        if (
          this.props.lookupHandler.lookupCriteriaView &&
          this.searchCriteriaRef.current !== null
        ) {
          if (this.criteriaViewRef.current)
            this.criteriaViewRef.current.focusRef.current.focus();
        }
      }, 500);
    } else {
      console.log("inside else  => ", this.props.value);

      this.showLookupWithCriteriaAndValue();
      this.setState({
        isShowLookup: true,
        showDataTable: true,
        isCriteriaOpen: true,
      });
      setTimeout(() => {
        this.setFocusOnResultGrid();
        if (
          this.props.lookupHandler.lookupCriteriaView &&
          this.searchCriteriaRef.current !== null
        ) {
          if (this.criteriaViewRef.current)
            this.criteriaViewRef.current.focusRef.current.focus();
        }
      }, 500);
    }
  };

  closeLookup = async () => {
    await this.setState({
      showDataTable: false,
      //lookupdata: null,
      filterText: "",
      isShowLookup: false,
      searchCriteria: [],
      lookupdata: this.props.lookupHandler.lookupdata,
    });
  };

  executeFilter = (e) => {
    e.preventDefault();
    let filterText = e.target.value;
    // this.setState({ filterText: filterText });
    this.setState({ filterText: filterText });

    // let criteria = this.state.searchCriteria;
    // if(criteria != null){
    //   if(e.target.name === "filterText"){
    //    criteria[]
    //   }
    // }
    /*
    let user_list = this.state.user_list;
    let newFilterText = e.target.value;
    this.filteredItems = user_list.filter(
      (item) =>
        item.userName &&
        item.userName.toLowerCase().includes(newFilterText.toLowerCase())
    );
    this.setState({ filterText: newFilterText });
    this.setState({ show_list: true });
    this.setState({ show_data: false });
    */
  };

  filterList = (pageNumber) => {
    let criteria = this.state.searchCriteria;
    console.log("criteria :", criteria);
    console.log("cirteria lookup :", this.props.lookupHandler.lookupCriteria);
    let value = this.state.filterText;

    console.log("loadPage criteria =>", value);
    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = pageNumber;
    if (criteria != null) {
      this.showLookupWithPaginationAndCriteria(pageNumber, criteria, value);
    } else {
      this.FilterAttributeList(value);
    }
  };
  FilterAttributeList = (value) => {
    console.log(
      "lookuphandler fetch :",
      this.props.lookupHandler.fetchDataFromService
    );
    console.log("lookuphandler  :", this.props.lookupHandler);
    let lookupDataList = [];
    this.state.lookupdata
      .filter((ft) => ft.code === value || ft.description === value)
      .map((list) => {
        console.log("filter List :", list);
        lookupDataList.push(list);
      });
    console.log("list :", lookupDataList);
    this.setState({ lookupdata: lookupDataList });
  };

  handleClear = () => {
    const { resetPaginationToggle, filterText } = this.state;

    if (this.state.filterText) {
      this.setState({
        resetPaginationToggle: !resetPaginationToggle,
        filterText: "",
      });
    }
  };

  resetFilter = () => {
    this.setState({ filterText: "" });
    let criteria = this.state.searchCriteria;
    if (criteria != null) {
      this.resetCriteria();
    } else {
      let lookupData = this.props.lookupHandler.lookupdata;
      console.log("lookupData :", lookupData);
      this.setState({ lookupdata: lookupData });
    }
  };

  showLookupWithCriteria = (searchCriteria) => {
    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, 0, searchCriteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, 0, searchCriteria);
    }
    this.setState({
      isShowLookup: true,
      showDataTable: true,
      criteriaOpen: false,
    });
  };

  showLookupWithCriteriaAndValue = () => {
    console.log("showLookupWithCriteriaAndValue is called");
    console.log(
      "this.state.searchCriteria",
      this.props.lookupHandler.lookupCriteria
    );
    console.log("this.state.value", this.state.value);
    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(
        this,
        0,
        this.props.lookupHandler.lookupCriteria,
        null
      );
      console.log("searchCriteria inside if", this.state.searchCriteria);
      console.log("value inside if", this.state.value);
    } else {
      this.props.lookupHandler.fetchDataFromService(
        this,
        0,
        this.props.lookupHandler.lookupCriteria,
        this.state.value
      );
      // this.searchCriteriaCallBack(this.state.searchCriteria);
      console.log("searchCriteria inside else", this.state.searchCriteria);
      console.log("value inside else", this.state.value);
    }
    this.setState({
      isShowLookup: true,
      showDataTable: true,
      criteriaOpen: false,
    });
  };

  searchCriteriaCallBack = (searchCriteria) => {
    this.setState({ searchCriteria: searchCriteria, isCriteriaOpen: false });
    // this.showLookupWithCriteria(searchCriteria);
    this.showLookupWithCriteriaAndValue();
  };

  renderCriteria = () => {
    const CriteriaView = this.props.lookupHandler.lookupCriteriaView;

    if (CriteriaView !== null && CriteriaView !== undefined) {
      return (
        <Popup
          ref={this.searchCriteriaRef}
          open={this.state.isCriteriaOpen}
          closeOnDocumentClick={false}
          repositionOnResize={true}
          position="center center"
          className="criteriaLookup"
          id="criteriaLookup"
        >
          <div className="modal">
            <button className="close" onClick={this.closeCriteriaModal}>
              &times;
            </button>

            <div className="moduleContainer" id="moduleContainer">
              <div className="modalHeaderWithButtons">
                <div className="modalButtonContainer modalLeftSideHeader">
                  {/* {props.headerButtonContainer && (
                    <div>{props.headerButtonContainer}</div>
                  )} */}
                </div>
                <div className="modalTitle">{"Search Criteria"}</div>
                <div className="modalRightSideHeader"></div>
              </div>
              <div className="content">
                {" "}
                <CriteriaView
                  ref={this.criteriaViewRef}
                  searchCriteria={this.state.searchCriteria}
                  searchCriteriaCallBack={this.searchCriteriaCallBack}
                />
              </div>
            </div>
          </div>
        </Popup>
      );
      //
    } else {
      return <></>;
    }
  };

  closeCriteriaModal = () => {
    this.setState({ isCriteriaOpen: false });
  };

  handleAfterClose = () => {
    this.clearLookupData();
    if (this.criteriaViewRef.current)
      this.criteriaViewRef.current.clearCriteria();
  };

  clearLookupData() {
    //for empty the lookup data & set and focus elements

    let emptyArray = new Array();
    this.setState({
      lookupdata: emptyArray,
      showDataTable: false,
    });
    console.log("show lookupdata :", this.state.lookupdata);
  }

  /* pagination */

  showLookupWithPaginationAndCriteria = (pageNumber, criteria, value) => {
    //this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(
        this,
        pageNumber,
        criteria,
        value
      );
    } else {
      this.props.lookupHandler.fetchDataFromService(
        this,
        pageNumber,
        criteria,
        value
      );
    }
    this.setState({
      isShowLookup: true,
      showDataTable: true,
      isCriteriaOpen: false,
    });

    //this.searchCriteriaRef.current.hide();
  };

  loadPage = (pageNumber) => {
    let criteria = this.state.searchCriteria;
    console.log("criteria :", criteria);
    let value = this.state.value;

    console.log("loadPage criteria =>", value);
    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = pageNumber;
    this.showLookupWithPaginationAndCriteria(pageNumber, criteria, value);
  };

  loadFirst = () => {
    this.loadPage(1);
  };
  loadPrevious = () => {
    let currentPage = this.state.pageResultDetails.currentPageNumber;
    let previousPage = currentPage - 1;
    this.loadPage(previousPage);
  };
  loadNext = () => {
    //let currentPage = this.state.pageList.currentPage;
    let currentPage = this.state.pageResultDetails.currentPageNumber;

    let nextPage = currentPage + 1;
    this.loadPage(nextPage);
  };
  loadLast = () => {
    let pageSize = this.state.pageResultDetails.pageSize;
    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let totalPages = totalCount / pageSize;
    totalPages += parseInt(totalCount % pageSize == 0 ? 0 : 1);

    this.loadPage(totalPages);
  };

  resetCriteria = () => {
    let resetCriteriaFromLookupHandler = this.props.lookupHandler.resetCriteria;
    this.setState({
      searchCriteria: resetCriteriaFromLookupHandler,
      //value: "",
    });

    //empty the textbox value

    if (this.criteriaViewRef.current)
      this.criteriaViewRef.current.clearCriteria(); // call the handler function using ref.

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = 1;
    this.showLookupWithPaginationAndCriteria(
      1,
      resetCriteriaFromLookupHandler,
      ""
    );
  };

  conditionalRowStyles = [
    {
      when: (row) => this.checkCurrentRow(row),
      style: {
        backgroundColor: "rgba(140, 140, 140, 0.9)",
        color: "white",
        "&:hover": {
          cursor: "pointer",
        },
      },
    },
  ];

  checkCurrentRow = (row) => {
    let dataList = this.state.lookupdata;
    if (dataList) {
      let currentRow = dataList[this.state.currentRowIndex];
      if (currentRow) {
        return currentRow[this.valueColumnName] == row[this.valueColumnName];
      }
    }
    //this.valueColumnName
    //return row[]
    //console.log(row);
    return false;
  };

  /*
Key	Code
ener key  13
left arrow	37
up arrow	38
right arrow	39
down arrow	40
*/

  resultGridHandleKeyDown = (event) => {
    if (event.keyCode == 13) {
      let dataList = this.state.lookupdata;
      if (dataList) {
        let currentRow = dataList[this.state.currentRowIndex];
        if (currentRow) {
          let selectedValue = currentRow[this.valueColumnName];
          this.props.onLookupValueSelected(selectedValue);
        }
      }
      event.preventDefault();
    } else if (event.keyCode == 38) {
      let currentRowIndex = this.state.currentRowIndex - 1;
      let dataList = this.state.lookupdata;
      if (dataList) {
        if (currentRowIndex < 0) {
          currentRowIndex = dataList.length - 1;
          if (currentRowIndex < 0) currentRowIndex = 0;
        }
      } else {
        currentRowIndex = 0;
      }
      this.setState({ currentRowIndex: currentRowIndex });
      this.scrollToRow(currentRowIndex);
      event.preventDefault();
    } else if (event.keyCode == 40) {
      let currentRowIndex = this.state.currentRowIndex + 1;
      let dataList = this.state.lookupdata;
      console.log("dataList...", dataList);
      if (dataList) {
        if (currentRowIndex >= dataList.length) {
          currentRowIndex = 0;
        }
      } else {
        currentRowIndex = 0;
      }
      this.setState({ currentRowIndex: currentRowIndex });
      this.scrollToRow(currentRowIndex);
      event.preventDefault();
    }
  };

  onRowClicked = (row, event) => {
    let currentRowIndex = this.state.currentRowIndex;
    let dataList = this.state.lookupdata;
    if (dataList) {
      currentRowIndex = this.getRowIndex(dataList, row);
      //console.log("Row : ", row, " Current Row Index : ", currentRowIndex);
      if (currentRowIndex < 0) {
        currentRowIndex = 0;
      }
    }
    this.setState({ currentRowIndex: currentRowIndex });
    //alert("Row Click");
    event.preventDefault();
  };

  onRowDoubleClicked = (row, event) => {
    //alert("Row Click");
    let selectedValue = row[this.valueColumnName];
    if (selectedValue) {
      this.props.onLookupValueSelected(selectedValue);
    }
    event.preventDefault();
  };

  getRowIndex = (dataList, row) => {
    for (let i = 0; i < dataList.length; i++) {
      if (dataList[i][this.valueColumnName] === row[this.valueColumnName]) {
        return i;
      }
    }
    return -1;
  };

  scrollToRow = (currentRowIndex) => {
    let rowId = "row-" + currentRowIndex;
    console.log("rowId...", rowId);
    scrollToElement(rowId);
    /*
    let divNode = ReactDOM.findDOMNode(rowId);
    console.log(divNode);
    if (divNode) {
      console.log(divNode);
      divNode.scrollIntoView();
    }
    */
  };

  //let listcolumns = props.listcolumns;
  render() {
    //console.log("Lookup dialog : Lookup Handler ", this.props.lookupHandler);
    //console.log("Lookup ShowTableFlag : " + this.state.showDataTable);

    if (!!this.state.lookupHandler) {
      console.log("Lookup Caption : " + this.props.lookupHandler.lookupTitle);
      console.log("Lookup Data : " + this.props.dataList);
      console.log("Lookup Columns : " + this.props.lookupColumnsList);
    }

    let lookupColumnsList = this.generateLookupColumns();
    let dataList = this.state.lookupdata;

    //console.log("datalist render :", dataList);
    // let dataPageList = new Array();
    // if (this.state.pageResultDetails.pageSize) {
    //   dataPageList = this.state.pageResultDetails.pageSize;
    //   console.log("dataPageList.length =>", dataPageList.length);
    // }

    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let currentPageNumber = this.state.pageResultDetails.currentPageNumber;
    let resultPageSize = this.state.pageResultDetails.pageSize;

    let totalPages = 0;
    let pageSize = resultPageSize;
    totalPages = totalCount / pageSize;
    totalPages += totalCount % pageSize == 0 ? 0 : 1;

    return (
      <>
        <Lookup
          ref={this.skyLightDialogRef}
          parentRef={this.skyLightDialogRef}
          isShowPopup={this.state.isShowLookup}
          title={
            !!this.props.lookupHandler
              ? this.props.lookupHandler.lookupTitle
              : ""
          }
          closeAlertModalCallBack={this.closeLookup}
          headercontent={
            this.state.showDataTable && (
              <Container>
                {/* <SkyLight ref={this.searchCriteriaRef} title={"Search Criteria"}> */}
                <div>{this.renderCriteria()}</div>
                {/* </SkyLight> */}
                <Form>
                  <Row>
                    <Col md={1}>
                      <FormLabel>Search</FormLabel>{" "}
                    </Col>
                    <Col md={7}>
                      <FormControl
                        id="search"
                        type="text"
                        placeholder="Search"
                        name="filterText"
                        value={this.state.filterText}
                        onChange={this.executeFilter}
                      />
                    </Col>

                    <Col md={1}>
                      {/* <Button size="sm" onClick={() => this.showLookup()}>
                        {" "}
                        <FilterIcon />
                     </Button>*/}
                      <Button size="sm" onClick={() => this.filterList(1)}>
                        {" "}
                        <FilterIcon />
                      </Button>
                    </Col>

                    <Col md={2}>
                      <Button size="sm" onClick={() => this.resetFilter()}>
                        {" "}
                        Reset
                      </Button>
                    </Col>

                    <Col md={1}>
                      <Button size="sm" onClick={() => this.resetCriteria()}>
                        {" "}
                        <RefreshIcon />
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Container>
            )
          }
          paginationContent={
            <div className="module_header_secondary_buttons">
              <Button
                size="sm"
                className="secondary_header_buttons"
                onClick={() => this.loadFirst()}
              >
                First
              </Button>
              <Button
                size="sm"
                className="secondary_header_buttons"
                onClick={() => this.loadPrevious()}
              >
                Previous
              </Button>
              <span className="black-color-font">
                PAGE - {currentPageNumber} of {parseInt(totalPages)}
              </span>
              <Button
                size="sm"
                className="secondary_header_buttons"
                onClick={() => this.loadNext()}
              >
                Next
              </Button>
              <Button
                size="sm"
                className="secondary_header_buttons"
                onClick={() => this.loadLast()}
              >
                Last
              </Button>
            </div>
          }
          resultContent={
            !!dataList &&
            this.state.showDataTable && (
              <div
                ref={this.resultGridRef}
                onKeyDown={this.resultGridHandleKeyDown}
                tabindex="0"
                class="lookupResultGrid"
              >
                <DataTable
                  keys="user"
                  columns={lookupColumnsList}
                  striped="true"
                  highlightOnHover="false"
                  pointerOnHover="true"
                  customStyles={this.customStyles}
                  data={dataList}
                  onRowClicked={this.onRowClicked}
                  onRowDoubleClicked={this.onRowDoubleClicked}
                  persistTableHead
                  fixedHeader
                  conditionalRowStyles={this.conditionalRowStyles}
                />
              </div>
            )
          }
        />
      </>
    );
  }
}

class LookupDialog_bkup_29Sep2021 extends React.Component {
  //resetPaginationToggle: false,
  //filterText:'',
  //currentpage:0,
  //perpage:10,
  //totalRows:0,
  //totalPages:0,
  static contextType = ApplicationDataContext;
  constructor(props) {
    super(props);

    let tempLookupData = null;
    this.loadDataFromServiceFlag = false;
    if (!!this.props.lookupHandler) {
      tempLookupData = this.props.lookupHandler.lookupdata;
      this.loadDataFromServiceFlag =
        this.props.lookupHandler.lookupDataCallback != null;
    }

    this.paginationFlag = false;
    if (!!this.props.paginationFlag) {
      this.paginationFlag = this.props.paginationFlag;
    }

    this.state = {
      //lookupHandler: props.lookupHandler,
      filterText: "",
      lookupdata: tempLookupData,
      pageResultDetails: new LookupResultDetails(),
      showDataTable: false,
      showCriteriaView: this.props.lookupHandler.lookupCriteriaView,
      pageList: new PageListBean(),
      searchCriteria: this.props.lookupHandler.searchCriteria,
      selectedValue: "",
    };

    this.skyLightDialogRef = React.createRef();
    this.searchCriteriaRef = React.createRef();
    //if (!!this.props.lookupHandler) this.generateLookupColumns();
  }

  componentDidMount() {
    const appData = this.context;
    this.companyCode = appData.companyCode;

    this._isMounted = true;

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    let currentPage = this.state.pageList.currentPage;
    if (currentPage == null || currentPage <= 0) {
      pageInput.currentPage = 1;
    } else {
      pageInput.currentPage = currentPage;
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  updateResultCallBack = (lookup_result_details) => {
    if (this._isMounted) {
      this.setState({
        lookupdata: lookup_result_details.pageData,
        pageResultDetails: lookup_result_details,
      });
    }
  };

  generateLookupColumns = () => {
    let lookupColumnsList = [];
    if (!!this.props.lookupHandler) {
      //console.log("GenerateLookupColumns  ", this.props.lookupHandler);
      for (let columnDef of this.props.lookupHandler.lookupColumnDefinitions) {
        lookupColumnsList.push(this.toLookupColumn(columnDef));
      }
      //this.setState({ lookupColumnsList: lookupColumnsList });
    }
    return lookupColumnsList;
  };

  toLookupColumn = (columnDef) => {
    //console.log("Lookup Column : ", columnDef);
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let lookupColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
    };

    if (columnDef.valueColumn === true) {
      //columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <span className="lookupLink" onClick={this.valueSelected}>
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      lookupColumnDef.cell = cellDef;
      lookupColumnDef.ignoreRowClick = true;
    }

    return lookupColumnDef;
  };

  valueSelected = (e) => {
    console.log(e);
    console.log("target:", e.target);
    console.log("target:value:", e.target.innerText);
    let selectedValue = e.target.innerText;

    if (!!this.props.onLookupValueSelected) {
      this.setState({ selectedValue: selectedValue });
      this.props.onLookupValueSelected(selectedValue);
    }

    //alert(e);
  };

  customStyles = {
    table: {
      style: {
        height: "400px",
        width: "100%",
        ScrollX: false,
        overflow: "auto",
      },
    },
  };

  skylightStyles = {
    dialogStyles: {
      height: "470px",
      width: "800px",
    },
  };

  showLookup = () => {
    this.skyLightDialogRef.current.show();
    //this.searchCriteriaRef.current.show();
    this.setState({ showDataTable: true });
    setTimeout(() => {
      if (
        this.props.lookupHandler.lookupCriteriaView &&
        this.searchCriteriaRef.current !== null
      ) {
        this.searchCriteriaRef.current.show();
      }
    }, 500);

    // if (this.loadDataFromServiceFlag) {
    //   this.props.lookupHandler.lookupDataCallback(this, 0);
    // } else {
    //   this.props.lookupHandler.fetchDataFromService(this, 0);
    // }
    // this.setState({ showDataTable: true });

    /*
    setTimeout(() => {
      this.setState({ showDataTable: true }, () => {
        if (this.loadDataFromServiceFlag) {
          this.props.lookupHandler.lookupDataCallback(this, 0);
        } else {
          this.props.lookupHandler.fetchDataFromService(this, 0);
        }
      });
    }, 500); // wait 500 Milliseconds, then reset to false
    */

    /*
    this.setState({ showDataTable: true }, () => {
      if (this.loadDataFromServiceFlag) {
        this.props.lookupHandler.lookupDataCallback(this, 0);
      } else {
        this.props.lookupHandler.fetchDataFromService(this, 0);
      }
    });
      */
    //this.skyLightDialogRef.current.show();
  };

  closeLookup = async () => {
    //closeLookup = () => {
    console.log("closeLookup is called..!");
    await this.setState({
      showDataTable: false,
      lookupdata: null,
      filterText: "",
    });
    this.skyLightDialogRef.current.hide();
  };

  executeFilter = (e) => {
    e.preventDefault();
    /*
    let user_list = this.state.user_list;
    let newFilterText = e.target.value;
    this.filteredItems = user_list.filter(
      (item) =>
        item.userName &&
        item.userName.toLowerCase().includes(newFilterText.toLowerCase())
    );
    this.setState({ filterText: newFilterText });
    this.setState({ show_list: true });
    this.setState({ show_data: false });
    */
  };

  handleClear = () => {
    const { resetPaginationToggle, filterText } = this.state;

    if (this.state.filterText) {
      this.setState({
        resetPaginationToggle: !resetPaginationToggle,
        filterText: "",
      });
    }
  };

  resetFilter = () => {
    this.setState({ filterText: "" });
    //document.getElementById("search").value = "";
  };

  showLookupWithCriteria = (searchCriteria) => {
    this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, 0, searchCriteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, 0, searchCriteria);
    }
    this.setState({ showDataTable: true });

    this.searchCriteriaRef.current.hide();
  };

  searchCriteriaCallBack = (searchCriteria) => {
    this.setState({ searchCriteria: searchCriteria });
    this.showLookupWithCriteria(searchCriteria);
  };

  // clearCriteriaCallBack = (searchCriteria) => {
  //   console.log("clearCriteriaCallBack =>", searchCriteria);
  // };

  renderCriteria = () => {
    const CriteriaView = this.props.lookupHandler.lookupCriteriaView;
    var titleStyle = {
      backgroundColor: "#333",
      color: "#fff",
    };

    var closeButtonStyle = {
      fontSize: "2.8em",
      right: "19px",
      top: "6px",
      color: "#fff",
    };
    if (CriteriaView !== null && CriteriaView !== undefined) {
      return (
        <SkyLight
          ref={this.searchCriteriaRef}
          title={"Search Criteria"}
          tabIndex={-1}
          titleStyle={titleStyle}
          closeButtonStyle={closeButtonStyle}
        >
          <CriteriaView
            searchCriteria={this.props.lookupHandler.lookupCriteria}
            searchCriteriaCallBack={this.searchCriteriaCallBack}
          />
        </SkyLight>
      );
      //
    } else {
      return <></>;
    }
  };

  handleAfterClose = () => {
    this.clearLookupData();
  };

  clearLookupData() {
    //for empty the lookup data & set and focus elements

    let emptyArray = new Array();
    this.setState({ lookupdata: emptyArray, showDataTable: false });
  }

  /* pagination */

  showLookupWithPaginationAndCriteria = (pageNumber, criteria) => {
    this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, pageNumber, criteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, pageNumber, criteria);
    }
    this.setState({ showDataTable: true });

    this.searchCriteriaRef.current.hide();
  };

  loadPage = (pageNumber) => {
    let criteria = this.state.searchCriteria;

    console.log("loadPage criteria =>", criteria);
    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = pageNumber;
    this.showLookupWithPaginationAndCriteria(pageNumber, criteria);
  };

  loadFirst = () => {
    this.loadPage(1);
  };
  loadPrevious = () => {
    let currentPage = this.state.pageResultDetails.currentPageNumber;
    let previousPage = currentPage - 1;
    this.loadPage(previousPage);
  };
  loadNext = () => {
    //let currentPage = this.state.pageList.currentPage;
    let currentPage = this.state.pageResultDetails.currentPageNumber;

    let nextPage = currentPage + 1;
    this.loadPage(nextPage);
  };
  loadLast = () => {
    let pageSize = this.state.pageResultDetails.pageSize;
    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let totalPages = totalCount / pageSize;
    totalPages += parseInt(totalCount % pageSize == 0 ? 0 : 1);

    this.loadPage(totalPages);
  };

  resetCriteria = () => {
    let resetCriteriaFromLookupHandler = this.props.lookupHandler.resetCriteria;
    resetCriteriaFromLookupHandler.companyCode = this.companyCode;
    this.setState({ searchCriteria: resetCriteriaFromLookupHandler });
    //this.loadFirst();

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = 1;
    this.showLookupWithPaginationAndCriteria(1, resetCriteriaFromLookupHandler);
  };

  //let listcolumns = props.listcolumns;
  render() {
    //console.log("Lookup dialog : Lookup Handler ", this.props.lookupHandler);
    console.log("Lookup ShowTableFlag : " + this.state.showDataTable);

    if (!!this.state.lookupHandler) {
      console.log("Lookup Caption : " + this.props.lookupHandler.lookupTitle);
      console.log("Lookup Data : " + this.props.dataList);
      console.log("Lookup Columns : " + this.props.lookupColumnsList);
    }

    let lookupColumnsList = this.generateLookupColumns();
    let dataList = this.state.lookupdata;
    // let dataPageList = new Array();
    // if (this.state.pageResultDetails.pageSize) {
    //   dataPageList = this.state.pageResultDetails.pageSize;
    //   console.log("dataPageList.length =>", dataPageList.length);
    // }

    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let currentPageNumber = this.state.pageResultDetails.currentPageNumber;
    let resultPageSize = this.state.pageResultDetails.pageSize;

    let totalPages = 0;
    let pageSize = resultPageSize;
    totalPages = totalCount / pageSize;
    totalPages += totalCount % pageSize == 0 ? 0 : 1;

    var lokupDialog = {
      width: "60%",
      height: "550px",
      marginTop: "-250px",
      marginLeft: "-35%",
    };

    var titleStyle = {
      backgroundColor: "#333",
      color: "#fff",
    };

    var closeButtonStyle = {
      fontSize: "2.8em",
      right: "19px",
      top: "6px",
      color: "#fff",
    };

    return (
      <>
        <SkyLight
          dialogStyles={lokupDialog}
          tabIndex={-1}
          ref={this.skyLightDialogRef}
          titleStyle={titleStyle}
          closeButtonStyle={closeButtonStyle}
          title={
            !!this.props.lookupHandler
              ? this.props.lookupHandler.lookupTitle
              : ""
          }
          afterClose={this.handleAfterClose}
        >
          {this.state.showDataTable && (
            <Container>
              {/* <SkyLight ref={this.searchCriteriaRef} title={"Search Criteria"}> */}
              <div>{this.renderCriteria()}</div>
              {/* </SkyLight> */}
              <form>
                <Row>
                  <Col md={1}>
                    <FormLabel>Search</FormLabel>{" "}
                  </Col>
                  <Col md={7}>
                    <FormControl
                      id="search"
                      type="text"
                      placeholder="Search"
                      value={this.state.filterText}
                      onChange={this.executeFilter}
                    />
                  </Col>

                  <Col md={2}>
                    <Button size="sm" onClick={() => this.resetFilter()}>
                      {" "}
                      Reset
                    </Button>
                  </Col>

                  <Col md={1}>
                    <Button size="sm" onClick={() => this.showLookup()}>
                      {" "}
                      <FilterIcon />
                    </Button>
                  </Col>

                  <Col md={1}>
                    <Button size="sm" onClick={() => this.resetCriteria()}>
                      {" "}
                      <RefreshIcon />
                    </Button>
                  </Col>
                </Row>
              </form>
            </Container>
          )}
          <div className="module_header_secondary_buttons">
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadFirst()}
            >
              First
            </Button>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadPrevious()}
            >
              Previous
            </Button>
            <span className="black-color-font">
              PAGE - {currentPageNumber} of {parseInt(totalPages)}
            </span>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadNext()}
            >
              Next
            </Button>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadLast()}
            >
              Last
            </Button>
          </div>

          {!!dataList && this.state.showDataTable && (
            <DataTable
              keys="user"
              columns={lookupColumnsList}
              striped="true"
              highlightOnHover="true"
              pointerOnHover="true"
              customStyles={this.customStyles}
              data={dataList}
              persistTableHead
              fixedHeader
            />
          )}
        </SkyLight>
      </>
    );
  }
}

class LookupDialog_bkup_27Sep2021 extends React.Component {
  //resetPaginationToggle: false,
  //filterText:'',
  //currentpage:0,
  //perpage:10,
  //totalRows:0,
  //totalPages:0,
  static contextType = ApplicationDataContext;

  constructor(props) {
    super(props);

    let tempLookupData = null;
    this.loadDataFromServiceFlag = false;
    if (!!this.props.lookupHandler) {
      tempLookupData = this.props.lookupHandler.lookupdata;
      this.loadDataFromServiceFlag =
        this.props.lookupHandler.lookupDataCallback != null;
    }

    this.paginationFlag = false;
    if (!!this.props.paginationFlag) {
      this.paginationFlag = this.props.paginationFlag;
    }

    this.state = {
      //lookupHandler: props.lookupHandler,
      filterText: "",
      lookupdata: tempLookupData,
      pageResultDetails: new LookupResultDetails(),
      showDataTable: false,
      showCriteriaView: this.props.lookupHandler.lookupCriteriaView,
      pageList: new PageListBean(),
      searchCriteria: this.props.lookupHandler.searchCriteria,
      selectedValue: "",
    };

    this.skyLightDialogRef = React.createRef();
    this.searchCriteriaRef = React.createRef();
    //if (!!this.props.lookupHandler) this.generateLookupColumns();
  }

  componentDidMount() {
    this._isMounted = true;

    const appData = this.context;
    this.companyCode = appData.companyCode;

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    let currentPage = this.state.pageList.currentPage;
    if (currentPage == null || currentPage <= 0) {
      pageInput.currentPage = 1;
    } else {
      pageInput.currentPage = currentPage;
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  updateResultCallBack = (lookup_result_details) => {
    if (this._isMounted) {
      this.setState({
        lookupdata: lookup_result_details.pageData,
        pageResultDetails: lookup_result_details,
      });
    }
  };

  generateLookupColumns = () => {
    let lookupColumnsList = [];
    if (!!this.props.lookupHandler) {
      //console.log("GenerateLookupColumns  ", this.props.lookupHandler);
      for (let columnDef of this.props.lookupHandler.lookupColumnDefinitions) {
        lookupColumnsList.push(this.toLookupColumn(columnDef));
      }
      //this.setState({ lookupColumnsList: lookupColumnsList });
    }
    return lookupColumnsList;
  };

  toLookupColumn = (columnDef) => {
    //console.log("Lookup Column : ", columnDef);
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let lookupColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
    };

    if (columnDef.valueColumn === true) {
      //columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <span className="lookupLink" onClick={this.valueSelected}>
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      lookupColumnDef.cell = cellDef;
      lookupColumnDef.ignoreRowClick = true;
    }

    return lookupColumnDef;
  };

  valueSelected = (e) => {
    console.log(e);
    console.log("target:", e.target);
    console.log("target:value:", e.target.innerText);
    let selectedValue = e.target.innerText;

    if (!!this.props.onLookupValueSelected) {
      this.setState({ selectedValue: selectedValue });
      this.props.onLookupValueSelected(selectedValue);
    }

    //alert(e);
  };

  customStyles = {
    table: {
      style: {
        height: "400px",
        width: "100%",
        ScrollX: false,
        overflow: "auto",
      },
    },
  };

  skylightStyles = {
    dialogStyles: {
      height: "470px",
      width: "800px",
    },
  };

  showLookup = () => {
    this.skyLightDialogRef.current.show();
    //this.searchCriteriaRef.current.show();
    this.setState({ showDataTable: true });
    setTimeout(() => {
      if (
        this.props.lookupHandler.lookupCriteriaView &&
        this.searchCriteriaRef.current !== null
      ) {
        this.searchCriteriaRef.current.show();
      }
    }, 500);

    // if (this.loadDataFromServiceFlag) {
    //   this.props.lookupHandler.lookupDataCallback(this, 0);
    // } else {
    //   this.props.lookupHandler.fetchDataFromService(this, 0);
    // }
    // this.setState({ showDataTable: true });

    /*
    setTimeout(() => {
      this.setState({ showDataTable: true }, () => {
        if (this.loadDataFromServiceFlag) {
          this.props.lookupHandler.lookupDataCallback(this, 0);
        } else {
          this.props.lookupHandler.fetchDataFromService(this, 0);
        }
      });
    }, 500); // wait 500 Milliseconds, then reset to false
    */

    /*
    this.setState({ showDataTable: true }, () => {
      if (this.loadDataFromServiceFlag) {
        this.props.lookupHandler.lookupDataCallback(this, 0);
      } else {
        this.props.lookupHandler.fetchDataFromService(this, 0);
      }
    });
      */
    //this.skyLightDialogRef.current.show();
  };

  closeLookup = async () => {
    //closeLookup = () => {
    console.log("closeLookup is called..!");
    await this.setState({
      showDataTable: false,
      lookupdata: null,
      filterText: "",
    });
    this.skyLightDialogRef.current.hide();
  };

  executeFilter = (e) => {
    e.preventDefault();
    /*
    let user_list = this.state.user_list;
    let newFilterText = e.target.value;
    this.filteredItems = user_list.filter(
      (item) =>
        item.userName &&
        item.userName.toLowerCase().includes(newFilterText.toLowerCase())
    );
    this.setState({ filterText: newFilterText });
    this.setState({ show_list: true });
    this.setState({ show_data: false });
    */
  };

  handleClear = () => {
    const { resetPaginationToggle, filterText } = this.state;

    if (this.state.filterText) {
      this.setState({
        resetPaginationToggle: !resetPaginationToggle,
        filterText: "",
      });
    }
  };

  resetFilter = () => {
    this.setState({ filterText: "" });
    //document.getElementById("search").value = "";
  };

  showLookupWithCriteria = (searchCriteria) => {
    this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, 0, searchCriteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, 0, searchCriteria);
    }
    this.setState({ showDataTable: true });

    this.searchCriteriaRef.current.hide();
  };

  searchCriteriaCallBack = (searchCriteria) => {
    this.setState({ searchCriteria: searchCriteria });
    this.showLookupWithCriteria(searchCriteria);
  };

  // clearCriteriaCallBack = (searchCriteria) => {
  //   console.log("clearCriteriaCallBack =>", searchCriteria);
  // };

  resetCriteria = () => {
    let resetCriteriaFromLookupHandler = this.props.lookupHandler.resetCriteria;
    resetCriteriaFromLookupHandler.companyCode = this.companyCode;
    this.setState({ searchCriteria: resetCriteriaFromLookupHandler });
    //this.loadFirst();

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = 1;
    this.showLookupWithPaginationAndCriteria(1, resetCriteriaFromLookupHandler);
  };

  renderCriteria = () => {
    const CriteriaView = this.props.lookupHandler.lookupCriteriaView;

    if (CriteriaView !== null && CriteriaView !== undefined) {
      return (
        <SkyLight
          ref={this.searchCriteriaRef}
          title={"Search Criteria"}
          tabIndex={-1}
        >
          <CriteriaView
            searchCriteria={this.props.lookupHandler.lookupCriteria}
            searchCriteriaCallBack={this.searchCriteriaCallBack}
          />
        </SkyLight>
      );
      //
    } else {
      return <></>;
    }
  };

  handleAfterClose = () => {
    this.clearLookupData();
  };

  clearLookupData() {
    //for empty the lookup data & set and focus elements

    let emptyArray = new Array();
    this.setState({ lookupdata: emptyArray, showDataTable: false });
  }

  /* pagination */

  showLookupWithPaginationAndCriteria = (pageNumber, criteria) => {
    this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, pageNumber, criteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, pageNumber, criteria);
    }
    this.setState({ showDataTable: true });

    this.searchCriteriaRef.current.hide();
  };

  loadPage = (pageNumber) => {
    let criteria = this.state.searchCriteria;

    //console.log("loadPage criteria =>", criteria);
    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = pageNumber;
    this.showLookupWithPaginationAndCriteria(pageNumber, criteria);
  };

  loadFirst = () => {
    this.loadPage(1);
  };
  loadPrevious = () => {
    let currentPage = this.state.pageResultDetails.currentPageNumber;
    let previousPage = currentPage - 1;
    this.loadPage(previousPage);
  };
  loadNext = () => {
    //let currentPage = this.state.pageList.currentPage;
    let currentPage = this.state.pageResultDetails.currentPageNumber;

    let nextPage = currentPage + 1;
    this.loadPage(nextPage);
  };
  loadLast = () => {
    let pageSize = this.state.pageResultDetails.pageSize;
    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let totalPages = totalCount / pageSize;
    totalPages += parseInt(totalCount % pageSize == 0 ? 0 : 1);

    this.loadPage(totalPages);
  };

  resetCriteria = () => {
    this.loadFirst();
  };

  //let listcolumns = props.listcolumns;
  render() {
    //console.log("Lookup dialog : Lookup Handler ", this.props.lookupHandler);
    console.log("Lookup ShowTableFlag : " + this.state.showDataTable);

    if (!!this.state.lookupHandler) {
      console.log("Lookup Caption : " + this.props.lookupHandler.lookupTitle);
      console.log("Lookup Data : " + this.props.dataList);
      console.log("Lookup Columns : " + this.props.lookupColumnsList);
    }

    let lookupColumnsList = this.generateLookupColumns();
    let dataList = this.state.lookupdata;
    // let dataPageList = new Array();
    // if (this.state.pageResultDetails.pageSize) {
    //   dataPageList = this.state.pageResultDetails.pageSize;
    //   console.log("dataPageList.length =>", dataPageList.length);
    // }

    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let currentPageNumber = this.state.pageResultDetails.currentPageNumber;
    let resultPageSize = this.state.pageResultDetails.pageSize;

    let totalPages = 0;
    let pageSize = resultPageSize;
    totalPages = totalCount / pageSize;
    totalPages += totalCount % pageSize == 0 ? 0 : 1;

    var lokupDialog = {
      width: "60%",
      height: "550px",
      marginTop: "-250px",
      marginLeft: "-35%",
    };

    return (
      <>
        <SkyLight
          dialogStyles={lokupDialog}
          tabIndex={-1}
          ref={this.skyLightDialogRef}
          title={
            !!this.props.lookupHandler
              ? this.props.lookupHandler.lookupTitle
              : ""
          }
          afterClose={this.handleAfterClose}
        >
          {this.state.showDataTable && (
            <Container>
              {/* <SkyLight ref={this.searchCriteriaRef} title={"Search Criteria"}> */}
              <div>{this.renderCriteria()}</div>
              {/* </SkyLight> */}
              <form>
                <Row>
                  <Col md={1}>
                    <FormLabel>Search</FormLabel>{" "}
                  </Col>
                  <Col md={7}>
                    <FormControl
                      id="search"
                      type="text"
                      placeholder="Search"
                      value={this.state.filterText}
                      onChange={this.executeFilter}
                    />
                  </Col>

                  <Col md={2}>
                    <Button size="sm" onClick={() => this.resetFilter()}>
                      {" "}
                      Reset
                    </Button>
                  </Col>

                  <Col md={1}>
                    <Button size="sm" onClick={() => this.showLookup()}>
                      {" "}
                      <FilterIcon />
                    </Button>
                  </Col>

                  <Col md={1}>
                    <Button size="sm" onClick={() => this.resetCriteria()}>
                      {" "}
                      <RefreshIcon />
                    </Button>
                  </Col>
                </Row>
              </form>
            </Container>
          )}
          <div className="module_header_secondary_buttons">
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadFirst()}
            >
              First
            </Button>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadPrevious()}
            >
              Previous
            </Button>
            <span className="black-color-font">
              PAGE - {currentPageNumber} of {parseInt(totalPages)}
            </span>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadNext()}
            >
              Next
            </Button>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadLast()}
            >
              Last
            </Button>
          </div>

          {!!dataList && this.state.showDataTable && (
            <DataTable
              keys="user"
              columns={lookupColumnsList}
              striped="true"
              highlightOnHover="true"
              pointerOnHover="true"
              customStyles={this.customStyles}
              data={dataList}
              persistTableHead
              fixedHeader
            />
          )}
        </SkyLight>
      </>
    );
  }
}

class LookupDialog_bkup_14Sep2021 extends React.Component {
  //resetPaginationToggle: false,
  //filterText:'',
  //currentpage:0,
  //perpage:10,
  //totalRows:0,
  //totalPages:0,

  constructor(props) {
    super(props);

    let tempLookupData = null;
    this.loadDataFromServiceFlag = false;
    if (!!this.props.lookupHandler) {
      tempLookupData = this.props.lookupHandler.lookupdata;
      this.loadDataFromServiceFlag =
        this.props.lookupHandler.lookupDataCallback != null;
    }

    this.paginationFlag = false;
    if (!!this.props.paginationFlag) {
      this.paginationFlag = this.props.paginationFlag;
    }

    this.state = {
      //lookupHandler: props.lookupHandler,
      filterText: "",
      lookupdata: tempLookupData,
      pageResultDetails: new LookupResultDetails(),
      showDataTable: false,
      showCriteriaView: this.props.lookupHandler.lookupCriteriaView,
      pageList: new PageListBean(),
      searchCriteria: this.props.lookupHandler.searchCriteria,
      selectedValue: "",
    };

    this.skyLightDialogRef = React.createRef();
    this.searchCriteriaRef = React.createRef();
    //if (!!this.props.lookupHandler) this.generateLookupColumns();
  }

  componentDidMount() {
    this._isMounted = true;

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    let currentPage = this.state.pageList.currentPage;
    if (currentPage == null || currentPage <= 0) {
      pageInput.currentPage = 1;
    } else {
      pageInput.currentPage = currentPage;
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  updateResultCallBack = (lookup_result_details) => {
    if (this._isMounted) {
      this.setState({
        lookupdata: lookup_result_details.pageData,
        pageResultDetails: lookup_result_details,
      });
    }
  };

  generateLookupColumns = () => {
    let lookupColumnsList = [];
    if (!!this.props.lookupHandler) {
      //console.log("GenerateLookupColumns  ", this.props.lookupHandler);
      for (let columnDef of this.props.lookupHandler.lookupColumnDefinitions) {
        lookupColumnsList.push(this.toLookupColumn(columnDef));
      }
      //this.setState({ lookupColumnsList: lookupColumnsList });
    }
    return lookupColumnsList;
  };

  toLookupColumn = (columnDef) => {
    //console.log("Lookup Column : ", columnDef);
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let lookupColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
    };

    if (columnDef.valueColumn === true) {
      //columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <span className="lookupLink" onClick={this.valueSelected}>
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      lookupColumnDef.cell = cellDef;
      lookupColumnDef.ignoreRowClick = true;
    }

    return lookupColumnDef;
  };

  valueSelected = (e) => {
    console.log(e);
    console.log("target:", e.target);
    console.log("target:value:", e.target.innerText);
    let selectedValue = e.target.innerText;

    if (!!this.props.onLookupValueSelected) {
      this.setState({ selectedValue: selectedValue });
      this.props.onLookupValueSelected(selectedValue);
    }

    //alert(e);
  };

  customStyles = {
    table: {
      style: {
        height: "300px",
        width: "100%",
        ScrollX: false,
        overflow: "auto",
      },
    },
  };

  skylightStyles = {
    dialogStyles: {
      height: "470px",
      width: "800px",
    },
  };

  showLookup = () => {
    this.skyLightDialogRef.current.show();
    //this.searchCriteriaRef.current.show();
    this.setState({ showDataTable: true });
    setTimeout(() => {
      if (
        this.props.lookupHandler.lookupCriteriaView &&
        this.searchCriteriaRef.current !== null
      ) {
        this.searchCriteriaRef.current.show();
      }
    }, 500);

    // if (this.loadDataFromServiceFlag) {
    //   this.props.lookupHandler.lookupDataCallback(this, 0);
    // } else {
    //   this.props.lookupHandler.fetchDataFromService(this, 0);
    // }
    // this.setState({ showDataTable: true });

    /*
    setTimeout(() => {
      this.setState({ showDataTable: true }, () => {
        if (this.loadDataFromServiceFlag) {
          this.props.lookupHandler.lookupDataCallback(this, 0);
        } else {
          this.props.lookupHandler.fetchDataFromService(this, 0);
        }
      });
    }, 500); // wait 500 Milliseconds, then reset to false
    */

    /*
    this.setState({ showDataTable: true }, () => {
      if (this.loadDataFromServiceFlag) {
        this.props.lookupHandler.lookupDataCallback(this, 0);
      } else {
        this.props.lookupHandler.fetchDataFromService(this, 0);
      }
    });
      */
    //this.skyLightDialogRef.current.show();
  };

  closeLookup = async () => {
    //closeLookup = () => {
    console.log("closeLookup is called..!");
    await this.setState({
      showDataTable: false,
      lookupdata: null,
      filterText: "",
    });
    this.skyLightDialogRef.current.hide();
  };

  executeFilter = (e) => {
    e.preventDefault();
    /*
    let user_list = this.state.user_list;
    let newFilterText = e.target.value;
    this.filteredItems = user_list.filter(
      (item) =>
        item.userName &&
        item.userName.toLowerCase().includes(newFilterText.toLowerCase())
    );
    this.setState({ filterText: newFilterText });
    this.setState({ show_list: true });
    this.setState({ show_data: false });
    */
  };

  handleClear = () => {
    const { resetPaginationToggle, filterText } = this.state;

    if (this.state.filterText) {
      this.setState({
        resetPaginationToggle: !resetPaginationToggle,
        filterText: "",
      });
    }
  };

  resetFilter = () => {
    this.setState({ filterText: "" });
    //document.getElementById("search").value = "";
  };

  showLookupWithCriteria = (searchCriteria) => {
    this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, 0, searchCriteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, 0, searchCriteria);
    }
    this.setState({ showDataTable: true });

    this.searchCriteriaRef.current.hide();
  };

  searchCriteriaCallBack = (searchCriteria) => {
    this.setState({ searchCriteria: searchCriteria });
    this.showLookupWithCriteria(searchCriteria);
  };

  renderCriteria = () => {
    const CriteriaView = this.props.lookupHandler.lookupCriteriaView;

    if (CriteriaView !== null && CriteriaView !== undefined) {
      return (
        <SkyLight
          ref={this.searchCriteriaRef}
          title={"Search Criteria"}
          tabIndex={-1}
        >
          <CriteriaView
            searchCriteria={this.props.lookupHandler.lookupCriteria}
            searchCriteriaCallBack={this.searchCriteriaCallBack}
          />
        </SkyLight>
      );
      //
    } else {
      return <></>;
    }
  };

  handleAfterClose = () => {
    this.clearLookupData();
  };

  clearLookupData() {
    //for empty the lookup data & set and focus elements

    let emptyArray = new Array();
    this.setState({ lookupdata: emptyArray, showDataTable: false });
  }

  /* pagination */

  showLookupWithPaginationAndCriteria = (pageNumber, criteria) => {
    this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, pageNumber, criteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, pageNumber, criteria);
    }
    this.setState({ showDataTable: true });

    this.searchCriteriaRef.current.hide();
  };

  loadPage = (pageNumber) => {
    let criteria = this.state.searchCriteria;

    //console.log("loadPage pageNumber =>", pageNumber);
    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = pageNumber;
    this.showLookupWithPaginationAndCriteria(pageNumber, criteria);
  };

  loadFirst = () => {
    this.loadPage(1);
  };
  loadPrevious = () => {
    let currentPage = this.state.pageResultDetails.currentPageNumber;
    let previousPage = currentPage - 1;
    this.loadPage(previousPage);
  };
  loadNext = () => {
    //let currentPage = this.state.pageList.currentPage;
    let currentPage = this.state.pageResultDetails.currentPageNumber;

    let nextPage = currentPage + 1;
    this.loadPage(nextPage);
  };
  loadLast = () => {
    let pageSize = this.state.pageResultDetails.pageSize;
    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let totalPages = totalCount / pageSize;
    totalPages += parseInt(totalCount % pageSize == 0 ? 0 : 1);

    this.loadPage(totalPages);
  };

  resetCriteria = () => {
    this.loadFirst();
  };

  //let listcolumns = props.listcolumns;
  render() {
    //console.log("Lookup dialog : Lookup Handler ", this.props.lookupHandler);
    console.log("Lookup ShowTableFlag : " + this.state.showDataTable);

    if (!!this.state.lookupHandler) {
      console.log("Lookup Caption : " + this.props.lookupHandler.lookupTitle);
      console.log("Lookup Data : " + this.props.dataList);
      console.log("Lookup Columns : " + this.props.lookupColumnsList);
    }

    let lookupColumnsList = this.generateLookupColumns();
    let dataList = this.state.lookupdata;
    // let dataPageList = new Array();
    // if (this.state.pageResultDetails.pageSize) {
    //   dataPageList = this.state.pageResultDetails.pageSize;
    //   console.log("dataPageList.length =>", dataPageList.length);
    // }

    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let currentPageNumber = this.state.pageResultDetails.currentPageNumber;
    let resultPageSize = this.state.pageResultDetails.pageSize;

    let totalPages = 0;
    let pageSize = resultPageSize;
    totalPages = totalCount / pageSize;
    totalPages += totalCount % pageSize == 0 ? 0 : 1;

    return (
      <>
        <SkyLight
          dialogStyles={this.skylightStyles}
          tabIndex={-1}
          ref={this.skyLightDialogRef}
          title={
            !!this.props.lookupHandler
              ? this.props.lookupHandler.lookupTitle
              : ""
          }
          afterClose={this.handleAfterClose}
        >
          {this.state.showDataTable && (
            <Container>
              {/* <SkyLight ref={this.searchCriteriaRef} title={"Search Criteria"}> */}
              <div>{this.renderCriteria()}</div>
              {/* </SkyLight> */}
              <form>
                <Row>
                  <Col md={1}>
                    <FormLabel>Search</FormLabel>{" "}
                  </Col>
                  <Col md={7}>
                    <FormControl
                      id="search"
                      type="text"
                      placeholder="Search"
                      value={this.state.filterText}
                      onChange={this.executeFilter}
                    />
                  </Col>

                  <Col md={2}>
                    <Button size="sm" onClick={() => this.resetFilter()}>
                      {" "}
                      Reset
                    </Button>
                  </Col>

                  <Col md={1}>
                    <Button size="sm" onClick={() => this.showLookup()}>
                      {" "}
                      <FilterIcon />
                    </Button>
                  </Col>

                  <Col md={1}>
                    <Button size="sm" onClick={() => this.resetCriteria()}>
                      {" "}
                      <RefreshIcon />
                    </Button>
                  </Col>
                </Row>
              </form>
            </Container>
          )}
          <div className="module_header_secondary_buttons">
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadFirst()}
            >
              First
            </Button>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadPrevious()}
            >
              Previous
            </Button>
            <span className="black-color-font">
              PAGE - {currentPageNumber} of {parseInt(totalPages)}
            </span>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadNext()}
            >
              Next
            </Button>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadLast()}
            >
              Last
            </Button>
          </div>

          {!!dataList && this.state.showDataTable && (
            <DataTable
              keys="user"
              columns={lookupColumnsList}
              striped="true"
              highlightOnHover="true"
              pointerOnHover="true"
              customStyles={this.customStyles}
              data={dataList}
              persistTableHead
            />
          )}
        </SkyLight>
      </>
    );
  }
}

class LookupDialog_bkup_13Sep2021 extends React.Component {
  //resetPaginationToggle: false,
  //filterText:'',
  //currentpage:0,
  //perpage:10,
  //totalRows:0,
  //totalPages:0,

  constructor(props) {
    super(props);

    let tempLookupData = null;
    this.loadDataFromServiceFlag = false;
    if (!!this.props.lookupHandler) {
      tempLookupData = this.props.lookupHandler.lookupdata;
      this.loadDataFromServiceFlag =
        this.props.lookupHandler.lookupDataCallback != null;
    }

    this.paginationFlag = false;
    if (!!this.props.paginationFlag) {
      this.paginationFlag = this.props.paginationFlag;
    }

    this.state = {
      //lookupHandler: props.lookupHandler,
      filterText: "",
      lookupdata: tempLookupData,
      pageResultDetails: new LookupResultDetails(),
      showDataTable: false,
      showCriteriaView: this.props.lookupHandler.lookupCriteriaView,
      pageList: new PageListBean(),
      searchCriteria: this.props.lookupHandler.searchCriteria,
    };

    this.skyLightDialogRef = React.createRef();
    this.searchCriteriaRef = React.createRef();
    //if (!!this.props.lookupHandler) this.generateLookupColumns();
  }

  componentDidMount() {
    this._isMounted = true;

    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    let currentPage = this.state.pageList.currentPage;
    if (currentPage == null || currentPage <= 0) {
      pageInput.currentPage = 1;
    } else {
      pageInput.currentPage = currentPage;
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  updateResultCallBack = (lookup_result_details) => {
    if (this._isMounted) {
      this.setState({
        lookupdata: lookup_result_details.pageData,
        pageResultDetails: lookup_result_details,
      });
    }
  };

  generateLookupColumns = () => {
    let lookupColumnsList = [];
    if (!!this.props.lookupHandler) {
      //console.log("GenerateLookupColumns  ", this.props.lookupHandler);
      for (let columnDef of this.props.lookupHandler.lookupColumnDefinitions) {
        lookupColumnsList.push(this.toLookupColumn(columnDef));
      }
      //this.setState({ lookupColumnsList: lookupColumnsList });
    }
    return lookupColumnsList;
  };

  toLookupColumn = (columnDef) => {
    //console.log("Lookup Column : ", columnDef);
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let lookupColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
    };

    if (columnDef.valueColumn === true) {
      //columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <span className="lookupLink" onClick={this.valueSelected}>
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      lookupColumnDef.cell = cellDef;
      lookupColumnDef.ignoreRowClick = true;
    }

    return lookupColumnDef;
  };

  valueSelected = (e) => {
    console.log(e);
    console.log("target:", e.target);
    console.log("target:value:", e.target.innerText);
    let selectedValue = e.target.innerText;

    if (!!this.props.onLookupValueSelected) {
      this.props.onLookupValueSelected(selectedValue);
    }

    //alert(e);
  };

  customStyles = {
    table: {
      style: {
        height: "300px",
        width: "100%",
        ScrollX: false,
        overflow: "auto",
      },
    },
  };

  skylightStyles = {
    dialogStyles: {
      height: "470px",
      width: "800px",
    },
  };

  showLookup = () => {
    this.skyLightDialogRef.current.show();
    //this.searchCriteriaRef.current.show();
    setTimeout(() => {
      if (
        this.props.lookupHandler.lookupCriteriaView &&
        this.searchCriteriaRef.current !== null
      ) {
        this.searchCriteriaRef.current.show();
      }
    }, 500);

    // if (this.loadDataFromServiceFlag) {
    //   this.props.lookupHandler.lookupDataCallback(this, 0);
    // } else {
    //   this.props.lookupHandler.fetchDataFromService(this, 0);
    // }
    // this.setState({ showDataTable: true });

    /*
    setTimeout(() => {
      this.setState({ showDataTable: true }, () => {
        if (this.loadDataFromServiceFlag) {
          this.props.lookupHandler.lookupDataCallback(this, 0);
        } else {
          this.props.lookupHandler.fetchDataFromService(this, 0);
        }
      });
    }, 500); // wait 500 Milliseconds, then reset to false
    */

    /*
    this.setState({ showDataTable: true }, () => {
      if (this.loadDataFromServiceFlag) {
        this.props.lookupHandler.lookupDataCallback(this, 0);
      } else {
        this.props.lookupHandler.fetchDataFromService(this, 0);
      }
    });
      */
    //this.skyLightDialogRef.current.show();
  };

  closeLookup = async () => {
    //closeLookup = () => {
    await this.setState({
      showDataTable: false,
      lookupdata: null,
      filterText: "",
    });
    this.skyLightDialogRef.current.hide();
  };

  executeFilter = (e) => {
    e.preventDefault();
    /*
    let user_list = this.state.user_list;
    let newFilterText = e.target.value;
    this.filteredItems = user_list.filter(
      (item) =>
        item.userName &&
        item.userName.toLowerCase().includes(newFilterText.toLowerCase())
    );
    this.setState({ filterText: newFilterText });
    this.setState({ show_list: true });
    this.setState({ show_data: false });
    */
  };

  handleClear = () => {
    const { resetPaginationToggle, filterText } = this.state;

    if (this.state.filterText) {
      this.setState({
        resetPaginationToggle: !resetPaginationToggle,
        filterText: "",
      });
    }
  };

  resetFilter = () => {
    this.setState({ filterText: "" });
    //document.getElementById("search").value = "";
  };

  showLookupWithCriteria = (searchCriteria) => {
    this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, 0, searchCriteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, 0, searchCriteria);
    }
    this.setState({ showDataTable: true });

    this.searchCriteriaRef.current.hide();
  };

  searchCriteriaCallBack = (searchCriteria) => {
    this.setState({ searchCriteria: searchCriteria });
    this.showLookupWithCriteria(searchCriteria);
  };

  renderCriteria = () => {
    const CriteriaView = this.props.lookupHandler.lookupCriteriaView;

    if (CriteriaView !== null && CriteriaView !== undefined) {
      return (
        <SkyLight ref={this.searchCriteriaRef} title={"Search Criteria"}>
          <CriteriaView
            searchCriteria={this.props.lookupHandler.lookupCriteria}
            searchCriteriaCallBack={this.searchCriteriaCallBack}
          />
        </SkyLight>
      );
      //
    } else {
      return <></>;
    }
  };

  handleAfterClose = () => {
    this.clearLookupData();
  };

  clearLookupData() {
    let emptyArray = new Array();
    //this.state.lookupdata = emptyArray;
    this.setState({ lookupdata: emptyArray });
  }

  /* pagination */

  showLookupWithPaginationAndCriteria = (pageNumber, criteria) => {
    this.skyLightDialogRef.current.show();

    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, pageNumber, criteria);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, pageNumber, criteria);
    }
    this.setState({ showDataTable: true });

    this.searchCriteriaRef.current.hide();
  };

  loadPage = (pageNumber) => {
    let criteria = this.state.searchCriteria;

    //console.log("loadPage pageNumber =>", pageNumber);
    let pageInput = new PageListBean();
    pageInput.pageSize = 50;
    pageInput.currentPage = pageNumber;
    this.showLookupWithPaginationAndCriteria(pageNumber, criteria);
  };

  loadFirst = () => {
    this.loadPage(1);
  };
  loadPrevious = () => {
    let currentPage = this.state.pageResultDetails.currentPageNumber;
    let previousPage = currentPage - 1;
    this.loadPage(previousPage);
  };
  loadNext = () => {
    //let currentPage = this.state.pageList.currentPage;
    let currentPage = this.state.pageResultDetails.currentPageNumber;

    let nextPage = currentPage + 1;
    this.loadPage(nextPage);
  };
  loadLast = () => {
    let pageSize = this.state.pageResultDetails.pageSize;
    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let totalPages = totalCount / pageSize;
    totalPages += parseInt(totalCount % pageSize == 0 ? 0 : 1);

    this.loadPage(totalPages);
  };

  resetCriteria = () => {
    this.loadFirst();
  };

  //let listcolumns = props.listcolumns;
  render() {
    //console.log("Lookup dialog : Lookup Handler ", this.props.lookupHandler);
    console.log("Lookup ShowTableFlag : " + this.state.showDataTable);

    if (!!this.state.lookupHandler) {
      console.log("Lookup Caption : " + this.props.lookupHandler.lookupTitle);
      console.log("Lookup Data : " + this.props.dataList);
      console.log("Lookup Columns : " + this.props.lookupColumnsList);
    }

    let lookupColumnsList = this.generateLookupColumns();
    let dataList = this.state.lookupdata;
    // let dataPageList = new Array();
    // if (this.state.pageResultDetails.pageSize) {
    //   dataPageList = this.state.pageResultDetails.pageSize;
    //   console.log("dataPageList.length =>", dataPageList.length);
    // }

    let totalCount = this.state.pageResultDetails.totalRecordsCount;
    let currentPageNumber = this.state.pageResultDetails.currentPageNumber;
    let resultPageSize = this.state.pageResultDetails.pageSize;

    let totalPages = 0;
    let pageSize = resultPageSize;
    totalPages = totalCount / pageSize;
    totalPages += totalCount % pageSize == 0 ? 0 : 1;

    return (
      <>
        <SkyLight
          dialogStyles={this.skylightStyles}
          ref={this.skyLightDialogRef}
          title={
            !!this.props.lookupHandler
              ? this.props.lookupHandler.lookupTitle
              : ""
          }
          afterClose={this.handleAfterClose}
        >
          {/* {this.state.showDataTable && ( */}
          <Container>
            {/* <SkyLight ref={this.searchCriteriaRef} title={"Search Criteria"}> */}
            <div>{this.renderCriteria()}</div>
            {/* </SkyLight> */}
            <form>
              <Row>
                <Col md={1}>
                  <FormLabel>Search</FormLabel>{" "}
                </Col>
                <Col md={7}>
                  <FormControl
                    id="search"
                    type="text"
                    placeholder="Search"
                    value={this.state.filterText}
                    onChange={this.executeFilter}
                  />
                </Col>

                <Col md={2}>
                  <Button size="sm" onClick={() => this.resetFilter()}>
                    {" "}
                    Reset
                  </Button>
                </Col>

                <Col md={1}>
                  <Button size="sm" onClick={() => this.showLookup()}>
                    {" "}
                    <FilterIcon />
                  </Button>
                </Col>

                <Col md={1}>
                  <Button size="sm" onClick={() => this.resetCriteria()}>
                    {" "}
                    <RefreshIcon />
                  </Button>
                </Col>
              </Row>
            </form>
          </Container>
          {/* )} */}
          <div className="module_header_secondary_buttons">
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadFirst()}
            >
              First
            </Button>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadPrevious()}
            >
              Previous
            </Button>
            <span className="black-color-font">
              PAGE - {currentPageNumber} of {parseInt(totalPages)}
            </span>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadNext()}
            >
              Next
            </Button>
            <Button
              size="sm"
              className="secondary_header_buttons"
              onClick={() => this.loadLast()}
            >
              Last
            </Button>
          </div>

          {!!dataList && this.state.showDataTable && (
            <DataTable
              keys="user"
              columns={lookupColumnsList}
              striped="true"
              highlightOnHover="true"
              pointerOnHover="true"
              customStyles={this.customStyles}
              data={dataList}
              persistTableHead
            />
          )}
        </SkyLight>
      </>
    );
  }
}

class LookupDialog_bkup_08Sep2021 extends React.Component {
  //resetPaginationToggle: false,
  //filterText:'',
  //currentpage:0,
  //perpage:10,
  //totalRows:0,
  //totalPages:0,

  constructor(props) {
    super(props);

    let tempLookupData = null;
    this.loadDataFromServiceFlag = false;
    if (!!this.props.lookupHandler) {
      tempLookupData = this.props.lookupHandler.lookupdata;
      this.loadDataFromServiceFlag =
        this.props.lookupHandler.lookupDataCallback != null;
    }

    this.paginationFlag = false;
    if (!!this.props.paginationFlag) {
      this.paginationFlag = this.props.paginationFlag;
    }

    this.state = {
      //lookupHandler: props.lookupHandler,
      filterText: "",
      lookupdata: tempLookupData,
      pageResultDetails: new LookupResultDetails(),
      showDataTable: false,
    };

    this.skyLightDialogRef = React.createRef();
    //if (!!this.props.lookupHandler) this.generateLookupColumns();
  }

  componentDidMount() {
    this._isMounted = true;
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  updateResultCallBack = (lookup_result_details) => {
    if (this._isMounted) {
      this.setState({
        lookupdata: lookup_result_details.pageData,
        pageResultDetails: lookup_result_details,
      });
    }
  };

  generateLookupColumns = () => {
    let lookupColumnsList = [];
    if (!!this.props.lookupHandler) {
      //console.log("GenerateLookupColumns  ", this.props.lookupHandler);
      for (let columnDef of this.props.lookupHandler.lookupColumnDefinitions) {
        lookupColumnsList.push(this.toLookupColumn(columnDef));
      }
      //this.setState({ lookupColumnsList: lookupColumnsList });
    }
    return lookupColumnsList;
  };

  toLookupColumn = (columnDef) => {
    //console.log("Lookup Column : ", columnDef);
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let lookupColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
    };

    if (columnDef.valueColumn === true) {
      //columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <span className="lookupLink" onClick={this.valueSelected}>
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      lookupColumnDef.cell = cellDef;
      lookupColumnDef.ignoreRowClick = true;
    }

    return lookupColumnDef;
  };

  valueSelected = (e) => {
    console.log(e);
    console.log("target:", e.target);
    console.log("target:value:", e.target.innerText);
    let selectedValue = e.target.innerText;

    if (!!this.props.onLookupValueSelected) {
      this.props.onLookupValueSelected(selectedValue);
    }

    //alert(e);
  };

  customStyles = {
    table: {
      style: {
        height: "300px",
        width: "750px",
        ScrollX: false,
        overflow: "auto",
      },
    },
  };

  skylightStyles = {
    height: "470px",
    width: "800px",
  };

  showLookup = () => {
    this.skyLightDialogRef.current.show();
    if (this.loadDataFromServiceFlag) {
      this.props.lookupHandler.lookupDataCallback(this, 0);
    } else {
      this.props.lookupHandler.fetchDataFromService(this, 0);
    }
    this.setState({ showDataTable: true });

    /*
    setTimeout(() => {
      this.setState({ showDataTable: true }, () => {
        if (this.loadDataFromServiceFlag) {
          this.props.lookupHandler.lookupDataCallback(this, 0);
        } else {
          this.props.lookupHandler.fetchDataFromService(this, 0);
        }
      });
    }, 500); // wait 500 Milliseconds, then reset to false
    */

    /*
    this.setState({ showDataTable: true }, () => {
      if (this.loadDataFromServiceFlag) {
        this.props.lookupHandler.lookupDataCallback(this, 0);
      } else {
        this.props.lookupHandler.fetchDataFromService(this, 0);
      }
    });
      */
    //this.skyLightDialogRef.current.show();
  };

  closeLookup = async () => {
    //closeLookup = () => {
    await this.setState({
      showDataTable: false,
      lookupdata: null,
      filterText: "",
    });
    this.skyLightDialogRef.current.hide();
  };

  executeFilter = (e) => {
    e.preventDefault();
    /*
    let user_list = this.state.user_list;
    let newFilterText = e.target.value;
    this.filteredItems = user_list.filter(
      (item) =>
        item.userName &&
        item.userName.toLowerCase().includes(newFilterText.toLowerCase())
    );
    this.setState({ filterText: newFilterText });
    this.setState({ show_list: true });
    this.setState({ show_data: false });
    */
  };

  handleClear = () => {
    const { resetPaginationToggle, filterText } = this.state;

    if (this.state.filterText) {
      this.setState({
        resetPaginationToggle: !resetPaginationToggle,
        filterText: "",
      });
    }
  };

  resetFilter = () => {
    this.setState({ filterText: "" });
    //document.getElementById("search").value = "";
  };

  //let listcolumns = props.listcolumns;
  render() {
    //console.log("Lookup dialog : Lookup Handler ", this.props.lookupHandler);
    console.log("Lookup ShowTableFlag : " + this.state.showDataTable);

    if (!!this.state.lookupHandler) {
      console.log("Lookup Caption : " + this.props.lookupHandler.lookupTitle);
      console.log("Lookup Data : " + this.props.dataList);
      console.log("Lookup Columns : " + this.props.lookupColumnsList);
    }

    let lookupColumnsList = this.generateLookupColumns();
    let dataList = this.state.lookupdata;

    return (
      <SkyLight
        dialogStyles={this.skylightStyles}
        ref={this.skyLightDialogRef}
        title={
          !!this.props.lookupHandler ? this.props.lookupHandler.lookupTitle : ""
        }
      >
        {this.state.showDataTable && (
          <Container>
            <form>
              <Row>
                <Col md={1}>
                  <FormLabel>Search</FormLabel>{" "}
                </Col>
                <Col md={8}>
                  <FormControl
                    id="search"
                    type="text"
                    placeholder="Search"
                    value={this.state.filterText}
                    onChange={this.executeFilter}
                  />
                </Col>

                <Col md={1}>
                  <Button size="sm" onClick={() => this.resetFilter()}>
                    {" "}
                    Reset
                  </Button>
                </Col>
              </Row>
            </form>
          </Container>
        )}

        {!!dataList && this.state.showDataTable && (
          <DataTable
            keys="user"
            columns={lookupColumnsList}
            striped="true"
            highlightOnHover="true"
            pointerOnHover="true"
            customStyles={this.customStyles}
            data={dataList}
            persistTableHead
          />
        )}
      </SkyLight>
    );
  }
}

export const DatePickerComponent = (props) => {
  const dateComponentInput = useRef(null);
  const [dateId, setDateId] = useState(null);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isModifyView, setModifyView] = useState(false);
  const onSetDate = (value) => {
    if (value != null && value != undefined && value != "Invalid Date") {
      let date = new Date(value);
      if (date.toLocaleString() == "Invalid Date") {
        date = "";
      }
      //console.log("onSetDate return date =>", date);
      return date;
    } else return null;
  };

  useEffect(() => {
    if (props.isModifyView != null) {
      if (props.isModifyView) {
        if (props.isModifyEditable != null) {
          setModifyView(props.isModifyEditable);
        } else {
          setModifyView(!props.isModifyView);
        }
      } else {
        if (props.isModifyEditable != null) {
          setModifyView(!props.isModifyEditable);
        }
      }
    } else {
      setModifyView(props.disabled);
    }
  });

  const onDateChange = (date) => {
    if (date != null && date != undefined && date != "Invalid Date") {
      let formattedDate = date.toJSON();
      let tempEventObejct = customEventObject(props.name, formattedDate);
      props.onChange(tempEventObejct);
    } else {
      if (document.activeElement.id) {
        let id = document.activeElement.id;
        document.getElementById(id).focus();
      }
    }

    if (isCalendarOpen) {
      setCalendarOpen(false);
    }
  };

  const handleFocus = (event) => {
    setDateId(document.activeElement.id);
    event.target.select();
  };

  const onCalendarClose = (event) => {
    //console.log("inside onCalendarClose ..!", dateId);
    if (dateId != null && dateId != undefined && dateId != "Invalid Date") {
      let id = document.getElementById(dateId);
      if (id != null && id != undefined && id != "Invalid Date") {
        document.getElementById(dateId).focus();

        focusNextElement();
      }
    }
  };

  const onCalendarOpen = (event) => {
    //console.log("inside onCalendarOpen ..!", document.activeElement.id);
    setDateId(document.activeElement.id);
  };

  const handleOnBlur = (event) => {
    let dateString = event.target.value;
    handleDateBeforeOnChange(dateString);
    setCalendarOpen(false);
  };

  const handleDateBeforeOnChange = (date) => {
    let finalDate = "";

    finalDate = moment(date, "MM.DD.YYYY").toDate();
    onDateChange(finalDate);
    setCalendarOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.keyCode == 9) {
      focusNextElement();
    }
    if (event.keyCode == 13) {
      focusNextElement();
    }

    //for f2 to show the calendar
    if (event.keyCode == 113) {
      setCalendarOpen(true);
    }

    // press esc for calendar close
    if (event.keyCode == 27) {
      setCalendarOpen(false);
    }
  };

  const calendarIconClick = (e) => {
    let currentValue = document.getElementById(props.name);
    setDateId(currentValue.id);
    document.getElementById(currentValue.id).focus();
    setCalendarOpen(true);
  };
  return (
    <div className="inner-addon right-addon">
      <i className="glyphicon" onClick={calendarIconClick}>
        <CalendarIcon />
      </i>
      <DatePicker
        id={props.name}
        ref={dateComponentInput}
        onChange={(date) => onDateChange(date)}
        selected={onSetDate(props.value)}
        className="form-control"
        type="date"
        dateFormat="MM/dd/yyyy"
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onCalendarClose={onCalendarClose}
        onCalendarOpen={onCalendarOpen}
        disabled={isModifyView}
        open={isCalendarOpen}
        onBlur={handleOnBlur}
        popperPlacement="auto"
        shouldCloseOnSelect={true}
      />
    </div>
  );
};

export const DatePickerComponent_bkup_23Sep2021 = (props) => {
  const dateComponentInput = useRef(null);
  const [dateId, setDateId] = useState(null);
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const onSetDate = (value) => {
    //console.log("onSetDate =>", value);
    if (value != null && value != undefined && value != "Invalid Date") {
      let date = new Date(value);
      if (date.toLocaleString() == "Invalid Date") {
        date = "";
      }
      //console.log("onSetDate return date =>", date);
      return date;
    } else return null;
    setCalendarOpen(false);
  };

  const onDateChange = (date) => {
    console.log("onDateChange =>", date);
    if (date != null && date != undefined && date != "Invalid Date") {
      let formattedDate = date.toJSON();
      let tempEventObejct = customEventObject(props.name, formattedDate);
      props.onChange(tempEventObejct);
    } else {
      if (document.activeElement.id) {
        let id = document.activeElement.id;
        document.getElementById(id).focus();
      }
    }
  };

  const handleFocus = (event) => {
    event.target.select();
  };

  const onCalendarClose = (event) => {
    if (dateId != null && dateId != undefined && dateId != "Invalid Date") {
      let id = document.getElementById(dateId);
      if (id != null && id != undefined && id != "Invalid Date") {
        document.getElementById(dateId).focus();
        focusNextElement();
      }
    }
  };

  const onCalendarOpen = (event) => {
    setDateId(document.activeElement.id);
  };

  const onBlurChange = (event) => {
    let dateString = event.target.value;
    beforeDateOnChange(dateString);

    setCalendarOpen(false);
  };

  const beforeDateOnChange = (date) => {
    let finalDate = "";
    //finalDate = moment(date, "MM.DD.YYYY").format("MM/DD/YYYY");
    finalDate = moment(date, "MM.DD.YYYY").toDate();
    //console.log("finalDate =>", finalDate);
    onDateChange(finalDate);
  };

  const handleKeyDown = (event) => {
    if (event.keyCode == 9) {
      focusNextElement();
    }
    if (event.keyCode == 13) {
      focusNextElement();
    }

    //for f2 to show the calendar
    if (event.keyCode == 113) {
      setCalendarOpen(true);
    }

    // press esc for calendar close
    if (event.keyCode == 27) {
      setCalendarOpen(false);
    }
  };

  return (
    <div className="inner-addon right-addon">
      <i className="glyphicon">
        <CalendarIcon />
      </i>
      <DatePicker
        id={props.name}
        ref={dateComponentInput}
        onChange={onDateChange}
        selected={onSetDate(props.value)}
        className="form-control"
        type="date"
        dateFormat="MM/dd/yyyy"
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onCalendarClose={onCalendarClose}
        onCalendarOpen={onCalendarOpen}
        disabled={props.disabled}
        open={isCalendarOpen}
        onBlur={onBlurChange}
        popperPlacement="auto"
      />
    </div>
  );
};

export const DatePickerComponent_bkup_13Sep2021 = (props) => {
  const dateComponentInput = useRef(null);
  const [dateId, setDateId] = useState(null);
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const onSetDate = (value) => {
    //console.log("onSetDate =>", value);
    if (value != null && value != undefined && value != "Invalid Date") {
      let date = new Date(value);
      if (date.toLocaleString() == "Invalid Date") {
        date = "";
      }
      //console.log("onSetDate return date =>", date);
      return date;
    } else return null;
    setCalendarOpen(false);
  };

  const onDateChange = (date) => {
    console.log("onDateChange =>", date);
    if (date != null && date != undefined && date != "Invalid Date") {
      let formattedDate = date.toJSON();
      let tempEventObejct = customEventObject(props.name, formattedDate);
      props.onChange(tempEventObejct);
    } else {
      if (document.activeElement.id) {
        let id = document.activeElement.id;
        document.getElementById(id).focus();
      }
    }
  };

  const handleFocus = (event) => {
    event.target.select();
  };

  const onCalendarClose = (event) => {
    if (dateId != null && dateId != undefined && dateId != "Invalid Date") {
      let id = document.getElementById(dateId);
      if (id != null && id != undefined && id != "Invalid Date") {
        document.getElementById(dateId).focus();
        focusNextElement();
      }
    }
  };

  const onCalendarOpen = (event) => {
    setDateId(document.activeElement.id);
  };

  const onBlurChange = (event) => {
    let dateString = event.target.value;
    beforeDateOnChange(dateString);

    setCalendarOpen(false);
  };

  const beforeDateOnChange = (date) => {
    let finalDate = "";
    //finalDate = moment(date, "MM.DD.YYYY").format("MM/DD/YYYY");
    finalDate = moment(date, "MM.DD.YYYY").toDate();
    //console.log("finalDate =>", finalDate);
    onDateChange(finalDate);
  };

  const handleKeyDown = (event) => {
    if (event.keyCode == 9) {
      focusNextElement();
    }
    if (event.keyCode == 13) {
      focusNextElement();
    }

    //for f2 to show the calendar
    if (event.keyCode == 113) {
      setCalendarOpen(true);
    }

    // press esc for calendar close
    if (event.keyCode == 27) {
      setCalendarOpen(false);
    }
  };

  return (
    <>
      <DatePicker
        id={props.name}
        ref={dateComponentInput}
        onChange={onDateChange}
        selected={onSetDate(props.value)}
        className="form-control"
        type="date"
        dateFormat="MM/dd/yyyy"
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onCalendarClose={onCalendarClose}
        onCalendarOpen={onCalendarOpen}
        disabled={props.disabled}
        open={isCalendarOpen}
        onBlur={onBlurChange}
        popperPlacement="auto"
      />
    </>
  );
};

export const DatePickerComponent_bkup_08Sep2021 = (props) => {
  const dateComponentInput = useRef(null);
  const [dateId, setDateId] = useState(null);
  const onSetDate = (value) => {
    if (value != null && value != undefined && value != "Invalid Date") {
      let date = new Date(value);
      if (date.toLocaleString() == "Invalid Date") {
        date = "";
      }
      return date;
    } else return null;
  };
  const onDateChange = (date) => {
    if (date != null && date != undefined && date != "Invalid Date") {
      let formattedDate = date.toJSON();
      let tempEventObejct = customEventObject(props.name, formattedDate);
      props.onChange(tempEventObejct);
    } else {
      let id = document.activeElement.id;
      document.getElementById(id).focus();
    }
  };
  const handleFocus = (event) => {
    event.target.select();
  };
  const onCalendarClose = (event) => {
    if (dateId != null && dateId != undefined && dateId != "Invalid Date") {
      let id = document.getElementById(dateId);
      if (id != null && id != undefined && id != "Invalid Date") {
        document.getElementById(dateId).focus();
        focusNextElement();
      }
    }
  };
  const onCalendarOpen = (event) => {
    setDateId(document.activeElement.id);
  };
  const handleKeyDown = (event) => {
    if (event.keyCode == 9) {
      focusNextElement();
    }
    if (event.keyCode == 13) {
      focusNextElement();
    }
  };
  return (
    <>
      <DatePicker
        id={props.name}
        ref={dateComponentInput}
        onChange={onDateChange}
        selected={onSetDate(props.value)}
        className="form-control"
        type="date"
        dateFormat="MM/dd/yyyy"
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onCalendarClose={onCalendarClose}
        onCalendarOpen={onCalendarOpen}
        disabled={props.disabled}
      />
    </>
  );
};

export class NumberFormatInputbox extends React.Component {
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
    this.state = { textValue: this.props.value };

    if (this.props.disabled == " " || this.props.disabled == null) {
      this.state = { isDisabled: false };
    } else {
      this.state = { isDisabled: this.props.disabled };
    }
  }

  componentDidMount() {
    this.modifyTextBox();
  }

  modifyTextBox = () => {
    if (this.props.isModifyView != null) {
      if (this.props.isModifyView) {
        if (this.props.isModifyEditable != null) {
          if (this.props.isModifyEditable) {
            this.setState({
              //isReadOnly: !this.props.isModifyView,
              isDisabled: !this.props.isModifyEditable,
            });
          } else {
            this.setState({
              //isReadOnly: !this.props.isModifyView,
              isDisabled: this.props.isModifyEditable,
            });
          }
        } else {
          this.setState({
            //isReadOnly: !this.props.isModifyView,
            isDisabled: !this.props.isModifyView,
          });
        }
      } else if (this.props.isModifyEditable != null) {
        // alert(this.props.isModifyEditable);
        this.setState({
          //isReadOnly: !this.props.isModifyView,
          isDisabled: this.props.isModifyEditable,
        });
      }
    }
  };

  componentDidUpdate() {
    // if (this.props.value !== this.state.textValue)
    //   this.setState({ textValue: this.props.value });
  }
  focus = () => {
    this.componentRef.current.focus();
  };
  handleFocus = (event) => {
    event.target.select();
  };

  handleKeyDown = (event) => {
    let isCustomHandledKeyDown = this.props.isCustomHandledKeyDown;
    if (isCustomHandledKeyDown) {
      this.props.customeOnKeyDown(event);
    } else {
      if (event.keyCode == 13) {
        //console.log("Enter Key is Pressed!", event.keyCode);
        focusNextElement();
      }
    }
  };

  onNumberChange = (e, fieldName) => {
    if (e.value == "") {
      //e.value = 0.0;
    }
    let tempEventObejct = customEventObject(fieldName, e.value);
    this.props.onChange(tempEventObejct);
  };

  handleOnBlur = (event) => {
    if (this.props.onBlur != null && this.props.onBlur != undefined) {
      this.props.onBlur(event);
    }
  };

  render() {
    return (
      <div>
        <NumberFormat
          ref={this.componentRef}
          id="id1"
          key="key1"
          value={this.props.value}
          //{...this.props}
          customInput={FormControl}
          thousandSeparator={true}
          fixedDecimalScale={true}
          decimalScale={this.props.decimalScale}
          name={this.props.name}
          className={this.props.className}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
          onValueChange={(e) => this.onNumberChange(e, this.props.name)}
          disabled={this.state.isDisabled}
          onBlur={this.handleOnBlur}
        />
      </div>
    );
  }
}

export class EditableDataGrid extends React.Component {
  static contextType = ApplicationDataContext;
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
  }

  toDataGridColumn = (columnDef) => {
    //console.log("Lookup Column : ", columnDef);
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let isCenter = columnDef.columnAlignment == 2 ? true : false;
    let tableHeaderAlign = "left";
    if (isRight) tableHeaderAlign = "right";
    else if (isCenter) tableHeaderAlign = "center";
    let tempDataGridColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
      minWidth: columnDef.columnMinWidth,
      maxWidth: columnDef.columnMaxWidth,
      center: isCenter,
      wrap: true,
      tableHeaderAlign: tableHeaderAlign,
    };

    if (columnDef.buttonColumn === true) {
      // if (columnDef.sortable === true) {
      //alert("sortable true");
      let cellDef = (row) => (
        <Button
          data-tag="allowRowEvents"
          onClick={(evt) => this.onButtonClick(evt, columnDef, row)}
          hidden={columnDef.columnDisabled}
        >
          {columnDef.columnBindingPropertyName}
        </Button>
      );
      tempDataGridColumnDef.cell = cellDef;
      tempDataGridColumnDef.ignoreRowClick = true;

      return tempDataGridColumnDef;
      /* } else {
        // alert("sortable false");
        console.log("sortable false");
        <FormLabel
          //data-tag="allowRowEvents"
          onClick={(evt) => this.onButtonClick(evt, columnDef)}
          // hidden={columnDef.columnDisabled}
        ></FormLabel>;
        // {columnDef.columnDisplayName}

        //  let cellDef = (row) => (
        /*  <Button
	          //data-tag="allowRowEvents"
	          onClick={(evt) => this.onButtonClick(evt, columnDef)}
	         // hidden={columnDef.columnDisabled}
	        >
	         // {columnDef.columnDisplayName}
	        </Button>
	      //);
	     // tempDataGridColumnDef.columnheader = cellDef;
	      tempDataGridColumnDef.ignoreRowClick = true;

	      return tempDataGridColumnDef;
      }*/
    }
    if (columnDef.inputBoxColumn === true) {
      let targetInputBoxName = columnDef.inputBoxTargetColumnName;

      let cellDef = (row) => (
        <NumberFormatInputbox
          name={targetInputBoxName}
          onChange={(e) => this.onInputBoxChange(e, columnDef, row)}
          onBlur={(evt) => this.onBlur(evt, columnDef, row)}
          className="text-right col-sm-12"
          value={row[columnDef.columnBindingPropertyName]}
          decimalScale={2}
          disabled={columnDef.columnDisabled}
        />
      );
      tempDataGridColumnDef.cell = cellDef;
      return tempDataGridColumnDef;
    }
    if (columnDef.imageColumn === true) {
      let cellDef = (row) => (
        <img
          src={this.onImageLinkCallBack(columnDef, row)}
          width={50}
          height={30}
          mode="fit"
        />
      );

      tempDataGridColumnDef.cell = cellDef;
      return tempDataGridColumnDef;
    }

    if (columnDef.hyperLinkcolumn === true) {
      //columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <span
          className="dataGridHyperLink"
          data-tag="allowRowEvents"
          onClick={(evt) => this.onHyperLinkClick(evt, columnDef, row)}
        >
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      tempDataGridColumnDef.cell = cellDef;
      tempDataGridColumnDef.ignoreRowClick = true;

      return tempDataGridColumnDef;
    }

    if (columnDef.checkBoxColumn === true) {
      let cellDef = (row) => (
        <InputCheckbox
          name={columnDef.columnBindingPropertyName}
          data-tag="allowRowEvents"
          onChange={(evt) => this.onCellCheckBoxClick(evt, columnDef, row)}
          checked={row[columnDef.columnBindingPropertyName]}
          disabled={columnDef.isDisabled}
        ></InputCheckbox>
      );

      tempDataGridColumnDef.cell = cellDef;
      tempDataGridColumnDef.ignoreRowClick = true;

      return tempDataGridColumnDef;
    }

    if (columnDef.statusColumn === true) {
      let cellDef = (row) => (
        <span>
          {this.getStatusCaption(
            columnDef,
            row[columnDef.columnBindingPropertyName]
          )}
        </span>
      );
      tempDataGridColumnDef.cell = cellDef;
      tempDataGridColumnDef.ignoreRowClick = true;
    }
    return tempDataGridColumnDef;
  };

  getStatusCaption = (columnDef, status) => {
    if (!!columnDef.getStatusCaption) {
      let finalStatus = columnDef.getStatusCaption(status);
      return finalStatus;
    }
  };

  onInputBoxChange = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.inputChangeCallback) {
        columnDef.inputChangeCallback(e, rowData);
      }
    }
  };

  onBlur = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.inputBoxOnBlurCallback) {
        columnDef.inputBoxOnBlurCallback(e, rowData);
      }
    }
  };

  onHyperLinkClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      let selectedValue = e.target.innerText;
      console.log("Hyperlink Clicked  => target:value:", selectedValue);
      if (!!columnDef.hyperLinkCallback) {
        columnDef.hyperLinkCallback(selectedValue, rowData);
      }
    }
    //alert(e);
  };

  onImageLinkCallBack = (columnDef, rowData) => {
    if (!!columnDef.imageLinkCallBack) {
      let col = columnDef.imageLinkCallBack(rowData);
      return col;
    }
  };

  onButtonClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.buttonClickCallback) {
        columnDef.buttonClickCallback(e, rowData);
      }
    }
  };

  onRowClicked = (e) => {
    console.log("Row Clicked :   ", e);
  };

  onCheckBoxClick = (e, columnDef, rowData) => {
    this.props.onCheckBoxClick(e);
  };

  onCellCheckBoxClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.checkBoxClickCallback) {
        rowData[columnDef.columnBindingPropertyName] = e.target.value;
        columnDef.checkBoxClickCallback(e, rowData);
      }
    }
  };

  render() {
    let dataGridColumnList = [];
    if (this.props.columnsList) {
      //console.log(this.props.columnsList);
      this.props.columnsList.map((cdef) =>
        dataGridColumnList.push(this.toDataGridColumn(cdef))
      );
    }

    let noDataComponent = (
      <DataTableNoDataComponent isLoading={this.props.isLoading} />
    );

    return (
      <DataTable
        ref={this.componentRef}
        keys={this.props.keys}
        columns={dataGridColumnList}
        striped={true}
        highlightOnHover={true}
        data={this.props.dataList}
        noDataComponent={noDataComponent}
        onRowClicked={this.onRowClicked}
        persistTableHead
        selectableRows={this.props.selectableRows} // add for checkbox selection
        onSelectedRowsChange={this.onCheckBoxClick}
        selectableRowSelected={this.props.selectableRowSelected}
        disabled={this.props.disabled}
        customStyles={this.props.customStyles}
        fixedHeader={this.props.fixedHeader}
      />
    );
  }
}

export class BootstrapDataGridColumnDefinition_old_30Jun2021 {
  constructor() {
    this.columnDisplayName = "";
    this.columnBindingPropertyName = "";
    this.columnType = "";
    this.editable = false;
    this.columnAlignment = 0;
    this.sortColumn = false;
    this.hyperLinkCallback = null;
    this.getStatusCaption = null;
    this.buttonIcon = null;
    this.buttonClickCallback = null;
    this.columnOnClickLink = null;
    this.columnOnChangeLink = null;
    this.columnOnKeyDownLink = null;
    this.columnOnBlurLink = null;
  }
  setDetails = (columnDisplayName = "", columnBindingPropertyName = "") => {
    this.columnDisplayName = columnDisplayName;
    this.columnBindingPropertyName = columnBindingPropertyName;
    return this;
  };
  setEditable = (editable = false) => {
    this.editable = editable;
    return this;
  };
  setColumnAlignment = (columnAlignment = 0) => {
    this.columnAlignment = columnAlignment;
    return this;
  };
  setSortColumn = (sortColumn = false) => {
    this.sortColumn = sortColumn;
    return this;
  };
  setColumnType = (columnType = "") => {
    this.columnType = columnType;
    return this;
  };
  callHyperLinkCallback = (hyperLinkCallback = null) => {
    this.hyperLinkCallback = hyperLinkCallback;
    return this;
  };
  setStatusCaptionConverter = (getStatusCaption = null) => {
    this.getStatusCaption = getStatusCaption;
    return this;
  };
  setButtonIcon = (buttonIcon = "") => {
    this.buttonIcon = buttonIcon;
    return this;
  };
  setButtonClickCallback = (buttonClickCallback = null) => {
    this.buttonClickCallback = buttonClickCallback;
    return this;
  };
  setColumnOnClickLink = (columnOnClickLink = null) => {
    this.columnOnClickLink = columnOnClickLink;
    return this;
  };
  setColumnOnChangeLink = (columnOnChangeLink = null) => {
    this.columnOnChangeLink = columnOnChangeLink;
    return this;
  };
  setColumnOnKeyDownLink = (columnOnKeyDownLink = null) => {
    this.columnOnKeyDownLink = columnOnKeyDownLink;
    return this;
  };
  setColumnOnBlurLink = (columnOnBlurLink = null) => {
    this.columnOnBlurLink = columnOnBlurLink;
    return this;
  };
  setColumnAutoCompleteValues = (
    columnAutoCompleteLookUpValues = null,
    columnAutoCompleteValueProperty = ""
  ) => {
    this.columnAutoCompleteLookUpValues = columnAutoCompleteLookUpValues;
    this.columnAutoCompleteValueProperty = columnAutoCompleteValueProperty;
    return this;
  };
  setColumnAutoCompleteDynamicSearchLink = (
    columnAutoCompleteDynamicSearchLink = null
  ) => {
    this.columnAutoCompleteDynamicSearchLink =
      columnAutoCompleteDynamicSearchLink;
    return this;
  };
}

export class BootstrapDataGrid_bkup_30Jun2021 extends React.Component {
  static contextType = ApplicationDataContext;
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
  }
  cellFormatter(cell, row, rowIndex, formatExtraData) {
    console.log("cell : ", cell);
    console.log("row : ", row);
    console.log("rowIndex : ", rowIndex);
    console.log("formatExtraData : ", formatExtraData);
    return (
      <span>
        <strong>{cell}</strong>
      </span>
      // <NumberFormatInputbox
      //   name={columnBindingPropertyName}
      //   onChange={(evt) => this.onChange(evt, columnDef, row)}
      //   onClick={(evt) => this.onClick(evt, columnDef, row)}
      //   onKeyDown={(evt) => this.onKeyDown(evt, columnDef, row)}
      //   onBlur={(evt) => this.onBlur(evt, columnDef, row)}
      //   className="text-right col-sm-12"
      //   value={row[columnDef.columnBindingPropertyName]}
      //   decimalScale={2}
      //   disabled={columnDef.disableTargetColumn}
      // />
    );
  }

  formatCells = (tempDataGridColumnDef, columnDef) => {
    console.log("columnDef.columnType : ", columnDef.columnType);
    if (columnDef.columnType == "AutoComplete") {
      tempDataGridColumnDef.formatter = (
        cell,
        row,
        rowIndex,
        formatExtraData
      ) => {
        return (
          <AutoCompleteTextbox
            name={columnDef.columnBindingPropertyName}
            placeholder={"Enter " + columnDef.columnBindingPropertyName}
            onChange={(evt) => this.onChange(evt, columnDef, row)}
            readOnly={columnDef.disableTargetColumn}
            defaultValue={row[columnDef.columnBindingPropertyName]}
            lookupValues={columnDef.columnAutoCompleteLookUpValues}
            valuePropery={columnDef.columnAutoCompleteValueProperty}
          />
        );
      };
    }
    if (columnDef.columnType == "DynamicAutoComplete") {
      tempDataGridColumnDef.formatter = (
        cell,
        row,
        rowIndex,
        formatExtraData
      ) => {
        return (
          <DynamicAutoCompleteTextbox
            ref={this.customerCodeRef}
            name={columnDef.columnBindingPropertyName}
            placeholder={"Select" + columnDef.columnBindingPropertyName}
            onChange={(evt) => this.onChange(evt, columnDef, row)}
            readOnly={columnDef.disableColumn}
            disabled={columnDef.disableColumn}
            defaultValue={row[columnDef.columnBindingPropertyName]}
            lookupValues={columnDef.columnAutoCompleteLookUpValues}
            //isLoading={true}
            handleSearch={(searchString) =>
              this.onSearch(searchString, columnDef, row)
            }
            onFocus={(evt) => this.onFocus(evt, columnDef, row)}
            valuePropery={columnDef.columnAutoCompleteValueProperty}
            descriptionProperty={columnDef.columnAutoCompleteValueProperty}
          />
        );
      };
    }
    if (columnDef.columnType == "Number") {
      tempDataGridColumnDef.formatter = (
        cell,
        row,
        rowIndex,
        formatExtraData
      ) => {
        return (
          <NumberFormatInputbox
            name={columnDef.columnBindingPropertyName}
            onChange={(evt) => this.onChange(evt, columnDef, row)}
            onClick={(evt) => this.onClick(evt, columnDef, row)}
            onKeyDown={(evt) => this.onKeyDown(evt, columnDef, row)}
            // onBlur={(evt) => this.onBlur(evt, columnDef, row)}
            // className="text-right col-sm-12"
            value={row[columnDef.columnBindingPropertyName]}
            decimalScale={2}
            // isCustomHandledKeyDown={}
            // disabled={columnDef.disableTargetColumn}
          />
        );
      };
    }
    if (columnDef.columnType == "hyperLink") {
      tempDataGridColumnDef.formatter = (
        cell,
        row,
        rowIndex,
        formatExtraData
      ) => {
        return (
          <span
            className="dataGridHyperLink"
            onClick={(evt) => this.onHyperLinkClick(evt, columnDef, row)}
          >
            {row[columnDef.columnBindingPropertyName]}
          </span>
        );
        //console.log("columnDef =>", columnDef);
      };
    }
  };

  onChange = (evt, columnDef, row) => {
    if (evt && evt.target) {
      if (!!columnDef.columnOnChangeLink) {
        columnDef.columnOnChangeLink(evt, row);
      }
    }
  };
  hyperLinkColumnCell = (tempDataGridColumnDef, columnDef) => {
    tempDataGridColumnDef.formatter = (
      cell,
      row,
      rowIndex,
      formatExtraData
    ) => {
      return (
        <span
          className="dataGridHyperLink"
          onClick={(evt) => this.onHyperLinkClick(evt, columnDef, row)}
        >
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
    };
  };

  onHyperLinkClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      let selectedValue = e.target.innerText;
      if (!!columnDef.hyperLinkCallback) {
        columnDef.hyperLinkCallback(selectedValue, rowData);
      }
    }
  };

  buttonColumnCell = (tempDataGridColumnDef, columnDef) => {
    tempDataGridColumnDef.formatter = (
      cell,
      row,
      rowIndex,
      formatExtraData
    ) => {
      return (
        <Button
          data-tag="allowRowEvents"
          onClick={(evt) => this.onButtonClick(evt, columnDef, row)}
        >
          {columnDef.buttonIcon}
        </Button>
      );
    };
  };

  statusColumnCell = (tempDataGridColumnDef, columnDef) => {
    tempDataGridColumnDef.formatter = (
      cell,
      row,
      rowIndex,
      formatExtraData
    ) => {
      return (
        <span>
          {this.getStatusCaption(
            columnDef,
            row[columnDef.columnBindingPropertyName]
          )}
        </span>
      );
      //console.log("columnDef =>", columnDef);
    };
  };

  getStatusCaption = (columnDef, status) => {
    if (!!columnDef.getStatusCaption) {
      let finalStatus = columnDef.getStatusCaption(status);
      return finalStatus;
    }
  };

  onButtonClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.buttonClickCallback) {
        columnDef.buttonClickCallback(e, rowData);
      }
    }
  };

  toBootstrapColumnDefinitions = (columnDef) => {
    let tempDataGridColumnDef = {
      dataField: columnDef.columnBindingPropertyName,
      text: columnDef.columnDisplayName,
      // editable: columnDef.editable,
      align: columnDef.columnAlignment,
      sort: columnDef.sortColumn,
    };
    if (columnDef.editable) {
      this.formatCells(tempDataGridColumnDef, columnDef);
    }

    if (columnDef.columnAlignment == 1) {
      tempDataGridColumnDef.align = "right"; // table cell align
      tempDataGridColumnDef.headerAlign = "right"; // table header cell align
    }

    if (columnDef.columnType == "hyperLink") {
      this.hyperLinkColumnCell(tempDataGridColumnDef, columnDef);
    }

    if (columnDef.columnType == "statusColumn") {
      this.statusColumnCell(tempDataGridColumnDef, columnDef);
    }

    if (columnDef.columnType == "button") {
      this.buttonColumnCell(tempDataGridColumnDef, columnDef);
    }
    if (columnDef.columnType == "number") {
      this.formatCells(tempDataGridColumnDef, columnDef);
    }

    tempDataGridColumnDef.events = {
      onFocus: (e, column, columnIndex, row, rowIndex) => {
        // console.log(e);
        // console.log(column);
        // console.log(columnIndex);
        // console.log(row);
        // console.log(rowIndex);
        // console.log("onFocus on Product ID field");
      },
      onKeyDown: (e, column, columnIndex, row, rowIndex) => {
        // console.log(e);
        // console.log(column);
        // console.log(columnIndex);
        // console.log(row);
        // console.log(rowIndex);
        // console.log("onkeydown on Product ID field");
      },
    };
    return tempDataGridColumnDef;
  };
  // rowEvents = {
  //   onClick: (e, row, rowIndex) => {
  //     console.log("onkeydown : ", e);
  //   },
  //   onFocus: (e) => {
  //     console.log("onfocus : ", e);
  //   },
  //   onKeyDown: (e) => {
  //     console.log("onkeydown : ", e);
  //   },
  // };
  render() {
    // let columnsList = BootstrapColumnDefinitions();
    let dataGridColumnList = [];
    if (this.props.columnsList) {
      this.props.columnsList.map((cdef) =>
        dataGridColumnList.push(this.toBootstrapColumnDefinitions(cdef))
      );
    }
    return (
      <BootstrapTable
        keyField={this.props.id}
        data={this.props.dataList}
        columns={dataGridColumnList}
        cellEdit={cellEditFactory({
          //mode: "click",
          // blurToSave: true,
        })}
        // rowEvents={this.rowEvents}
      />
    );
  }
}

export class DataGridComponentColumnDefinitions {
  constructor() {
    this.columnDisplayName = "";
    this.columnBindingPropertyName = "";
    this.columnAlignment = 0; // 0 -->Left  1-->Right  2-->Center
    this.columnComponentType = "";
    this.columnOnChangeLink = null;
    this.columnOnClickLink = null;
    this.columnOnKeyDownLink = null;
    this.columnOnBlurLink = null;
    this.columnCheckBoxClickLink = null;
    this.columnRowClickLink = null;
    this.columnImageClickLink = null;
    this.columnMinWidth = "";
    this.columnMaxWidth = "";
    this.columnDisabled = false;

    this.columnAutoCompleteLookUpValues = new Array();
    this.columnAutoCompleteDefaultValue = "";
    this.columnAutoCompleteValueProperty = "";
    this.columnAutoCompleteDescriptionProperty = "";
    this.columnAutoCompleteDynamicSearchLink = "";

    this.customColumnValueLink = "";
  }
  setDetails = (
    columnDisplayName = "",
    columnBindingPropertyName = "",
    columnAlignment = 0
  ) => {
    this.columnDisplayName = columnDisplayName;
    this.columnBindingPropertyName = columnBindingPropertyName;
    this.columnAlignment = columnAlignment;
    return this;
  };
  setColumnMinWidth = (columnMinWidth = "") => {
    this.columnMinWidth = columnMinWidth;
    return this;
  };
  setColumnMaxWidth = (columnMaxWidth = "") => {
    this.columnMaxWidth = columnMaxWidth;
    return this;
  };
  setComponentType = (columnComponentType = "") => {
    this.columnComponentType = columnComponentType;
    return this;
  }; //Type = "null",Type = "button",Type = "image",Type = "date",Type = "number"
  setDisabled = (columnDisabled = false) => {
    this.columnDisabled = columnDisabled;
    return this;
  };
  setOnClickLink = (columnOnClickLink = null) => {
    this.columnOnClickLink = columnOnClickLink;
    return this;
  };
  setOnChangeLink = (columnOnChangeLink = null) => {
    this.columnOnChangeLink = columnOnChangeLink;
    return this;
  };
  setOnKeyDownLink = (columnOnKeyDownLink = null) => {
    this.columnOnKeyDownLink = columnOnKeyDownLink;
    return this;
  };
  setOnBlurLink = (columnOnBlurLink = null) => {
    this.columnOnBlurLink = columnOnBlurLink;
    return this;
  };
  setOnKeyDownLink = (columnOnKeyDownLink = null) => {
    this.columnOnKeyDownLink = columnOnKeyDownLink;
    return this;
  };
  setOnCheckBoxClickLink = (columnCheckBoxClickLink = null) => {
    this.columnCheckBoxClickLink = columnCheckBoxClickLink;
    return this;
  };
  setOnRowClickLink = (columnRowClickLink = null) => {
    this.columnRowClickLink = columnRowClickLink;
    return this;
  };
  setOnImageClickLink = (columnImageClickLink = null) => {
    this.columnImageClickLink = columnImageClickLink;
    return this;
  };
  setAutoCompleteTextBoxDetails = (
    columnAutoCompleteLookUpValues = new Array(),
    columnAutoCompleteValueProperty = "",
    columnAutoCompleteDescriptionProperty = ""
  ) => {
    this.columnAutoCompleteLookUpValues = columnAutoCompleteLookUpValues;
    this.columnAutoCompleteValueProperty = columnAutoCompleteValueProperty;
    this.columnAutoCompleteDescriptionProperty =
      columnAutoCompleteDescriptionProperty;
    return this;
  };
  setAutoCompleteDynamicSearchLink = (
    columnAutoCompleteDynamicSearchLink = null
  ) => {
    this.columnAutoCompleteDynamicSearchLink =
      columnAutoCompleteDynamicSearchLink;
    return this;
  };
  setCustomColumnValueLink = (customColumnValueLink = null) => {
    this.customColumnValueLink = customColumnValueLink;
    return this;
  };
}
export class DataGridComponent extends React.Component {
  static contextType = ApplicationDataContext;
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
  }
  toDataGridColumn = (columnDef) => {
    //console.log("Lookup Column : ", columnDef);
    let isRight = columnDef.columnAlignment == 1 ? true : false;
    let isCenter = columnDef.columnAlignment == 2 ? true : false;
    let tempDataGridColumnDef = {
      name: columnDef.columnDisplayName,
      selector: columnDef.columnBindingPropertyName,
      sortable: true,
      right: isRight,
      center: isCenter,
      minWidth: columnDef.columnMinWidth,
      maxWidth: columnDef.columnMaxWidth,
      wrap: true,
    };
    //console.log("columnOnClickLink : ", columnDef.columnOnClickLink);
    //console.log("!!columnDef.columnOnClickLink", !!columnDef.columnOnClickLink);
    if (!!columnDef.columnOnClickLink) {
      let cellDef = (row) => (
        <span
          className="dataGridHyperLink"
          data-tag="allowRowEvents"
          onClick={(evt) => this.onClick(evt, columnDef, row)}
        >
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
      //console.log("!!columnDef.columnOnClickLink : cellDef : ", cellDef);
      tempDataGridColumnDef.cell = cellDef;
      tempDataGridColumnDef.ignoreRowClick = true;
    }

    if (columnDef.columnComponentType === "button") {
      let cellDef = (row) => (
        <Button
          data-tag="allowRowEvents"
          onClick={(evt) => this.onClick(evt, columnDef, row)}
        >
          {columnDef.columnBindingPropertyName}
        </Button>
      );
      tempDataGridColumnDef.cell = cellDef;
      tempDataGridColumnDef.ignoreRowClick = true;
      return tempDataGridColumnDef;
    }
    if (columnDef.columnComponentType === "number") {
      let columnBindingPropertyName = columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <NumberFormatInputbox
          name={columnBindingPropertyName}
          onChange={(evt) => this.onChange(evt, columnDef, row)}
          onClick={(evt) => this.onClick(evt, columnDef, row)}
          onKeyDown={(evt) => this.onKeyDown(evt, columnDef, row)}
          onBlur={(evt) => this.onBlur(evt, columnDef, row)}
          className="text-right col-sm-12"
          value={row[columnDef.columnBindingPropertyName]}
          decimalScale={2}
          disabled={columnDef.disableTargetColumn}
        />
      );
      tempDataGridColumnDef.cell = cellDef;
      return tempDataGridColumnDef;
    }
    if (columnDef.imageColumn === "image") {
      let cellDef = (row) => (
        <img
          src={this.onImageClickLink(columnDef, row)}
          width={50}
          height={30}
          mode="fit"
        />
      );
      tempDataGridColumnDef.cell = cellDef;
      tempDataGridColumnDef.ignoreRowClick = true;
      return tempDataGridColumnDef;
    }
    if (columnDef.columnComponentType === "autocomplete") {
      let columnBindingPropertyName = columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        // <NumberFormatInputbox
        //   name={columnBindingPropertyName}
        //   onChange={(evt) => this.onChange(evt, columnDef, row)}
        //   className="text-right col-sm-12"
        //   value={row[columnDef.columnBindingPropertyName]}
        //   decimalScale={2}
        //   disabled={columnDef.disableTargetColumn}
        // />
        <AutoCompleteTextbox
          name={columnBindingPropertyName}
          placeholder={"Enter " + columnBindingPropertyName}
          onChange={(evt) => this.onChange(evt, columnDef, row)}
          readOnly={columnDef.disableTargetColumn}
          defaultValue={row[columnDef.columnBindingPropertyName]}
          lookupValues={columnDef.columnAutoCompleteLookUpValues}
          valuePropery={columnDef.columnAutoCompleteValueProperty}
        />
      );
      tempDataGridColumnDef.cell = cellDef;
      //console.log("autocomplete : cellDef : ", tempDataGridColumnDef);
      return tempDataGridColumnDef;
    }

    if (columnDef.columnComponentType === "dynamicautocomplete") {
      let columnBindingPropertyName = columnDef.columnBindingPropertyName;
      let cellDef = (row) => (
        <DynamicAutoCompleteTextbox
          ref={this.customerCodeRef}
          name={columnBindingPropertyName}
          placeholder={"Select" + columnBindingPropertyName}
          onChange={(evt) => this.onChange(evt, columnDef, row)}
          readOnly={columnDef.disableTargetColumn}
          disabled={columnDef.columnDisabled}
          defaultValue={row[columnDef.columnBindingPropertyName]}
          lookupValues={columnDef.columnAutoCompleteLookUpValues}
          //isLoading={true}
          handleSearch={(searchString) =>
            this.onSearch(searchString, columnDef, row)
          }
          onFocus={(evt) => this.onFocus(evt, columnDef, row)}
          valuePropery={columnDef.columnAutoCompleteValueProperty}
          descriptionProperty={columnDef.columnAutoCompleteValueProperty}
        />
      );
      tempDataGridColumnDef.cell = cellDef;
      console.log("autocomplete : cellDef : ", tempDataGridColumnDef);
      return tempDataGridColumnDef;
    }
    return tempDataGridColumnDef;
  };

  // this.columnOnChangeLink = false;
  // this.columnOnClickLink = false;
  // this.columnOnKeyDownLink = false;
  // this.columnOnBlurLink = false;
  // this.columnCheckBoxLink = false;

  onFocus = (e, columnDef, rowData) => {
    console.log("onChange : e ", e);
    console.log("onChange : columnDef ", columnDef);
    console.log("onChange : rowData ", rowData);
    if (e && e.target) {
      if (!!columnDef.columnOnChangeLink) {
        //columnDef.columnOnChangeLink(e, rowData);
      }
    }
  };
  onChange = (e, columnDef, rowData) => {
    console.log("onChange : e ", e);
    console.log("onChange : columnDef ", columnDef);
    console.log("onChange : rowData ", rowData);
    if (e && e.target) {
      if (!!columnDef.columnOnChangeLink) {
        columnDef.columnOnChangeLink(e, rowData);
      }
    }
  };
  onClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      let selectedValue = e.target.innerText;
      if (!!columnDef.columnOnClickLink) {
        columnDef.columnOnClickLink(selectedValue, rowData);
      }
    }
  };
  onImageClickLink = (columnDef, rowData) => {
    if (!!columnDef.columnOnClickLink) {
      columnDef.columnImageClickLink(columnDef, rowData);
    }
  };
  onKeyDown = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.columnOnKeyDownLink) {
        let tempEventObejct = customEventObject(
          columnDef.columnBindingPropertyName,
          e
        );
        columnDef.columnOnKeyDownLink(tempEventObejct, rowData);
      }
    }
  };
  onBlur = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.columnOnBlurLink) {
        columnDef.columnOnBlurLink(e, rowData);
      }
    }
  };
  onCheckBoxClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.columnCheckBoxLink) {
        columnDef.columnCheckBoxLink(e, rowData);
      }
    }
  };
  //onSearch = (searchString, columnDef, rowData) => {
  onSearch = (searchString, columnDef, rowData) => {
    console.log("onSearch : searchString ", searchString);
    console.log("onSearch : columnDef ", columnDef);
    console.log("onSearch : rowData ", rowData);
    if (searchString) {
      if (!!columnDef.columnAutoCompleteDynamicSearchLink) {
        columnDef.columnAutoCompleteDynamicSearchLink(
          searchString,
          columnDef,
          rowData
        );
      }
    }
  };
  render() {
    let dataGridColumnList = [];
    if (this.props.columnsList) {
      this.props.columnsList.map((cdef) =>
        dataGridColumnList.push(this.toDataGridColumn(cdef))
      );
    }
    let noDataComponent = (
      <DataTableNoDataComponent isLoading={this.props.isLoading} />
    );
    return (
      <DataTable
        ref={this.componentRef}
        keys={this.props.keys}
        columns={dataGridColumnList}
        striped={true}
        highlightOnHover={true}
        data={this.props.dataList}
        noDataComponent={noDataComponent}
        onRowClicked={this.props.onRowClicked}
        persistTableHead
        selectableRows={this.props.selectableRows} // add for checkbox selection
        onSelectedRowsChange={this.onCheckBoxClick}
        disabled={this.props.disabled}
        customStyles={this.props.customStyles}
        fixedHeader={this.props.fixedHeader}
      />
    );
  }
}
export const Alert = (props) => {
  const handleClose = () => props.handleClose();
  return (
    <>
      <Modal show={props.show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Alert!!</Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.error}</Modal.Body>
        {/* <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer> */}
      </Modal>
    </>
  );
};

const ShowError = (value) => {
  alert("Error : " + value);
};

const ShowInfo = (value) => {
  alert("Information : " + value);
};

export class InputRadiobox extends React.Component {
  constructor(props) {
    super(props);
    this.lookupRef = React.createRef();
    this.componentRef = React.createRef();
    this.state = { checked: this.props.checked };
  }

  componentDidUpdate() {
    if (this.props.checked !== this.state.checked)
      this.setState({ checked: this.props.checked });
  }

  handleFocus = (event) => {
    event.target.select();
  };

  handleKeyDown = (event) => {
    if (event.keyCode == 13) {
      //console.log("Enter Key is Pressed!", event.keyCode);
      focusNextElement();
    }
  };

  handleOnChange = (event) => {
    let isChecked = event.target.checked;
    this.setState({ checked: isChecked });

    let tempEventObejct = customEventObject(this.props.name, isChecked);
    this.props.onChange(tempEventObejct);
  };

  render() {
    return (
      <div className="check-box-container">
        <input
          type="radio"
          {...this.props}
          checked={this.state.checked}
          onChange={this.handleOnChange}
        />
      </div>
    );
  }
}
export class ReasonCaptureComponent extends React.Component {
  constructor(props) {
    super(props);

    this.styles = {
      width: "30%",
      height: "calc(50% - 50px)",
      marginTop: "-200px",
      marginLeft: "-20%",
      overflowX: "none",
      top: "45%",
      //overflowY: "scroll",
    };
    this.state = { reasons: [], reasonData: new ReasonBean() };
    this.skyLightDialogRef = React.createRef();
  }

  componentDidMount() {
    //
  }

  showDialog = () => {
    this.skyLightDialogRef.current.show();
  };

  closeDialog = () => {
    this.skyLightDialogRef.current.hide();
  };

  handleAfterClose = () => {
    this.setState({ isShowElements: false });
  };

  handleFocus = (event) => {
    event.target.select();
  };

  handleKeyDown = (event) => {
    if (event.keyCode == 13) {
      console.log("Enter Key is Pressed!", event.keyCode);
      focusNextElement();
    }
  };

  onChange = (e) => {
    this.props.onChange(e);
  };

  onClick = () => {
    this.props.onClick();
  };

  render() {
    let reasonData = this.props.reasonData;
    let reasons = this.props.reasons;
    //console.log("this.props.reasons : ", reasons);
    if (isEmpty(reasonData)) {
      reasonData = new ReasonBean();
    }

    return (
      <div>
        <SkyLight
          dialogStyles={this.styles}
          hideOnOverlayClicked
          ref={this.skyLightDialogRef}
          title={this.props.title}
          afterClose={this.handleAfterClose}
        >
          <Container>
            <div>
              <Row>
                <Col sm="3">
                  <FormLabel>Reason</FormLabel>
                </Col>

                <Col sm="8">
                  <AutoCompleteTextbox
                    name="code"
                    placeholder="Enter Reason"
                    onChange={this.onChange}
                    defaultValue={reasonData.code}
                    lookupValues={reasons}
                    valuePropery="code"
                    descriptionProperty="description"
                  />
                </Col>
              </Row>
              <Row className="h-100">
                <Col sm="3">
                  <FormLabel>Description</FormLabel>
                </Col>

                <Col sm="8">
                  <textarea
                    rows="3"
                    className=" form-control"
                    name="description"
                    type="text"
                    placeholder="Enter Description"
                    onChange={this.onChange}
                    defaultValue={reasonData.description}
                  />
                </Col>
              </Row>
            </div>
          </Container>

          <Row>
            <Row>
              <div className="popup_btn_container_center">
                <Button onClick={this.onClick}> Continue</Button>
              </div>
            </Row>
          </Row>
        </SkyLight>
      </div>
    );
  }
}

export class BootstrapDataGridColumnDefinition {
  constructor() {
    this.columnDisplayName = "";
    this.columnBindingPropertyName = "";
    this.columnType = "";
    this.editable = false;
    this.columnAlignment = 0;
    this.sortColumn = false;
    this.hyperLinkCallback = null;
    this.getStatusCaption = null;
    this.buttonIcon = null;
    this.buttonClickCallback = null;
    this.columnOnClickLink = null;
    this.columnOnChangeLink = null;
    this.columnOnKeyDownLink = null;
    this.columnOnBlurLink = null;
    this.width = null;
    this.disabled = false;
  }
  setDetails = (columnDisplayName = "", columnBindingPropertyName = "") => {
    this.columnDisplayName = columnDisplayName;
    this.columnBindingPropertyName = columnBindingPropertyName;
    return this;
  };
  setWidth = (width = "") => {
    this.width = width;
    return this;
  };
  setEditable = (editable = false) => {
    this.editable = editable;
    return this;
  };
  setColumnAlignment = (columnAlignment = 0) => {
    this.columnAlignment = columnAlignment;
    return this;
  };
  setSortColumn = (sortColumn = false) => {
    this.sortColumn = sortColumn;
    return this;
  };
  setColumnType = (columnType = "") => {
    this.columnType = columnType;
    return this;
  };
  callHyperLinkCallback = (hyperLinkCallback = null) => {
    this.hyperLinkCallback = hyperLinkCallback;
    return this;
  };
  setStatusCaptionConverter = (getStatusCaption = null) => {
    this.getStatusCaption = getStatusCaption;
    return this;
  };
  setButtonIcon = (buttonIcon = "") => {
    this.buttonIcon = buttonIcon;
    return this;
  };
  setButtonClickCallback = (buttonClickCallback = null) => {
    this.buttonClickCallback = buttonClickCallback;
    return this;
  };
  setColumnOnClickLink = (columnOnClickLink = null) => {
    this.columnOnClickLink = columnOnClickLink;
    return this;
  };
  setColumnOnChangeLink = (columnOnChangeLink = null) => {
    this.columnOnChangeLink = columnOnChangeLink;
    return this;
  };
  setColumnOnKeyDownLink = (columnOnKeyDownLink = null) => {
    this.columnOnKeyDownLink = columnOnKeyDownLink;
    return this;
  };
  setColumnOnBlurLink = (columnOnBlurLink = null) => {
    this.columnOnBlurLink = columnOnBlurLink;
    return this;
  };
  setColumnAutoCompleteValues = (
    columnAutoCompleteLookUpValues = null,
    columnAutoCompleteValueProperty = ""
  ) => {
    this.columnAutoCompleteLookUpValues = columnAutoCompleteLookUpValues;
    this.columnAutoCompleteValueProperty = columnAutoCompleteValueProperty;
    return this;
  };
  setColumnAutoCompleteDynamicSearchLink = (
    columnAutoCompleteDynamicSearchLink = null
  ) => {
    this.columnAutoCompleteDynamicSearchLink =
      columnAutoCompleteDynamicSearchLink;
    return this;
  };
  setDisabled = (disabled = false) => {
    this.disabled = disabled;
    return this;
  };
}

export class BootstrapDataGrid extends React.Component {
  static contextType = ApplicationDataContext;
  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
  }
  cellFormatter(cell, row, rowIndex, formatExtraData) {
    console.log("cell : ", cell);
    console.log("row : ", row);
    console.log("rowIndex : ", rowIndex);
    console.log("formatExtraData : ", formatExtraData);
    return (
      <span>
        <strong>{cell}</strong>
      </span>
      // <NumberFormatInputbox
      //   name={columnBindingPropertyName}
      //   onChange={(evt) => this.onChange(evt, columnDef, row)}
      //   onClick={(evt) => this.onClick(evt, columnDef, row)}
      //   onKeyDown={(evt) => this.onKeyDown(evt, columnDef, row)}
      //   onBlur={(evt) => this.onBlur(evt, columnDef, row)}
      //   className="text-right col-sm-12"
      //   value={row[columnDef.columnBindingPropertyName]}
      //   decimalScale={2}
      //   disabled={columnDef.disableTargetColumn}
      // />
    );
  }

  //console.log("columnDef.columnType : ", columnDef.columnType);
  formatCells = (tempDataGridColumnDef, columnDef) => {
    if (columnDef.columnType == "AutoComplete") {
      tempDataGridColumnDef.formatter = (
        cell,
        row,
        rowIndex,
        formatExtraData
      ) => {
        return (
          <AutoCompleteTextbox
            name={columnDef.columnBindingPropertyName}
            placeholder={"Enter " + columnDef.columnBindingPropertyName}
            onChange={(evt) => this.onChange(evt, columnDef, row)}
            readOnly={columnDef.disableTargetColumn}
            defaultValue={row[columnDef.columnBindingPropertyName]}
            lookupValues={columnDef.columnAutoCompleteLookUpValues}
            valuePropery={columnDef.columnAutoCompleteValueProperty}
          />
        );
      };
    }
    if (columnDef.columnType == "DynamicAutoComplete") {
      tempDataGridColumnDef.formatter = (
        cell,
        row,
        rowIndex,
        formatExtraData
      ) => {
        return (
          <DynamicAutoCompleteTextbox
            ref={this.customerCodeRef}
            name={columnDef.columnBindingPropertyName}
            placeholder={"Select" + columnDef.columnBindingPropertyName}
            onChange={(evt) => this.onChange(evt, columnDef, row)}
            readOnly={columnDef.disableColumn}
            disabled={columnDef.disableColumn}
            defaultValue={row[columnDef.columnBindingPropertyName]}
            lookupValues={columnDef.columnAutoCompleteLookUpValues}
            //isLoading={true}
            handleSearch={(searchString) =>
              this.onSearch(searchString, columnDef, row)
            }
            onFocus={(evt) => this.onFocus(evt, columnDef, row)}
            valuePropery={columnDef.columnAutoCompleteValueProperty}
            descriptionProperty={columnDef.columnAutoCompleteValueProperty}
          />
        );
      };
    }
    if (columnDef.columnType == "Number") {
      tempDataGridColumnDef.formatter = (
        cell,
        row,
        rowIndex,
        formatExtraData
      ) => {
        return (
          <NumberFormatInputbox
            name={columnDef.columnBindingPropertyName}
            onChange={(evt) => this.onChange(evt, columnDef, row)}
            onClick={(evt) => this.onClick(evt, columnDef, row)}
            onKeyDown={(evt) => this.onKeyDown(evt, columnDef, row)}
            onBlur={(evt) => this.onBlur(evt, columnDef, row)}
            // className="text-right col-sm-12"
            value={row[columnDef.columnBindingPropertyName]}
            decimalScale={2}
            // isCustomHandledKeyDown={}
            // disabled={columnDef.disableTargetColumn}
          />
        );
      };
    }
    if (columnDef.columnType == "hyperLink") {
      tempDataGridColumnDef.formatter = (
        cell,
        row,
        rowIndex,
        formatExtraData
      ) => {
        return (
          <span
            className="dataGridHyperLink"
            onClick={(evt) => this.onHyperLinkClick(evt, columnDef, row)}
          >
            {row[columnDef.columnBindingPropertyName]}
          </span>
        );
        //console.log("columnDef =>", columnDef);
      };
    }
  };

  onChange = (evt, columnDef, row) => {
    if (evt && evt.target) {
      if (!!columnDef.columnOnChangeLink) {
        columnDef.columnOnChangeLink(evt, row);
      }
    }
  };

  onBlur = (evt, columnDef, row) => {
    if (evt && evt.target) {
      if (!!columnDef.columnOnBlurLink) {
        columnDef.columnOnBlurLink(evt, row);
      }
    }
  };
  hyperLinkColumnCell = (tempDataGridColumnDef, columnDef) => {
    tempDataGridColumnDef.formatter = (
      cell,
      row,
      rowIndex,
      formatExtraData
    ) => {
      return (
        <span
          className="dataGridHyperLink"
          onClick={(evt) => this.onHyperLinkClick(evt, columnDef, row)}
        >
          {row[columnDef.columnBindingPropertyName]}
        </span>
      );
    };
  };

  onHyperLinkClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      let selectedValue = e.target.innerText;
      if (!!columnDef.hyperLinkCallback) {
        columnDef.hyperLinkCallback(selectedValue, rowData);
      }
    }
  };

  buttonColumnCell = (tempDataGridColumnDef, columnDef) => {
    tempDataGridColumnDef.formatter = (
      cell,
      row,
      rowIndex,
      formatExtraData
    ) => {
      return (
        <Button
          data-tag="allowRowEvents"
          onClick={(evt) => this.onButtonClick(evt, columnDef, row)}
        >
          {columnDef.buttonIcon}
        </Button>
      );
    };
  };

  statusColumnCell = (tempDataGridColumnDef, columnDef) => {
    tempDataGridColumnDef.formatter = (
      cell,
      row,
      rowIndex,
      formatExtraData
    ) => {
      return (
        <span>
          {this.getStatusCaption(
            columnDef,
            row[columnDef.columnBindingPropertyName]
          )}
        </span>
      );
      //console.log("columnDef =>", columnDef);
    };
  };

  checkBoxColumnCell = (tempDataGridColumnDef, columnDef) => {
    tempDataGridColumnDef.formatter = (
      cell,
      row,
      rowIndex,
      formatExtraData
    ) => {
      return (
        <InputCheckbox
          name={columnDef.columnBindingPropertyName}
          data-tag="allowRowEvents"
          onChange={(evt) => this.onChange(evt, columnDef, row)}
          checked={row[columnDef.columnBindingPropertyName]}
          disabled={columnDef.disabled}
        ></InputCheckbox>
      );
    };
  };
  onCellCheckBoxClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.checkBoxClickCallback) {
        rowData[columnDef.columnBindingPropertyName] = e.target.value;
        columnDef.checkBoxClickCallback(e, rowData);
      }
    }
  };

  getStatusCaption = (columnDef, status) => {
    if (!!columnDef.getStatusCaption) {
      let finalStatus = columnDef.getStatusCaption(status);
      return finalStatus;
    }
  };

  onButtonClick = (e, columnDef, rowData) => {
    if (e && e.target) {
      if (!!columnDef.buttonClickCallback) {
        columnDef.buttonClickCallback(e, rowData);
      }
    }
  };

  toBootstrapColumnDefinitions = (columnDef) => {
    let tempDataGridColumnDef = {
      dataField: columnDef.columnBindingPropertyName,
      text: columnDef.columnDisplayName,
      // editable: columnDef.editable,
      align: columnDef.columnAlignment,
      sort: columnDef.sortColumn,
      style: { width: columnDef.width, maxWidth: columnDef.width },
      headerStyle: { width: columnDef.width, maxWidth: columnDef.width },
    };
    if (columnDef.editable) {
      this.formatCells(tempDataGridColumnDef, columnDef);
    }

    if (columnDef.columnAlignment == 1) {
      tempDataGridColumnDef.align = "right"; // table cell align
      tempDataGridColumnDef.headerAlign = "right"; // table header cell align
    }

    if (columnDef.columnType == "hyperLink") {
      this.hyperLinkColumnCell(tempDataGridColumnDef, columnDef);
    }

    if (columnDef.columnType == "statusColumn") {
      this.statusColumnCell(tempDataGridColumnDef, columnDef);
    }

    if (columnDef.columnType == "button") {
      this.buttonColumnCell(tempDataGridColumnDef, columnDef);
    }
    if (columnDef.columnType == "number") {
      this.formatCells(tempDataGridColumnDef, columnDef);
    }
    if (columnDef.columnType == "checkBox") {
      this.checkBoxColumnCell(tempDataGridColumnDef, columnDef);
    }

    tempDataGridColumnDef.events = {
      onFocus: (e, column, columnIndex, row, rowIndex) => {
        // console.log(e);
        // console.log(column);
        // console.log(columnIndex);
        // console.log(row);
        // console.log(rowIndex);
        // console.log("onFocus on Product ID field");
      },
      onKeyDown: (e, column, columnIndex, row, rowIndex) => {
        // console.log(e);
        // console.log(column);
        // console.log(columnIndex);
        // console.log(row);
        // console.log(rowIndex);
        // console.log("onkeydown on Product ID field");
      },
    };
    return tempDataGridColumnDef;
  };
  // rowEvents = {
  //   onClick: (e, row, rowIndex) => {
  //     console.log("onkeydown : ", e);
  //   },
  //   onFocus: (e) => {
  //     console.log("onfocus : ", e);
  //   },
  //   onKeyDown: (e) => {
  //     console.log("onkeydown : ", e);
  //   },
  // };
  render() {
    // let columnsList = BootstrapColumnDefinitions();
    let dataGridColumnList = [];
    if (this.props.columnsList) {
      this.props.columnsList.map((cdef) =>
        dataGridColumnList.push(this.toBootstrapColumnDefinitions(cdef))
      );
    }
    return (
      <BootstrapTable
        keyField={this.props.id}
        data={this.props.dataList}
        columns={dataGridColumnList}
        cellEdit={cellEditFactory({
          //mode: "click",
          // blurToSave: true,
        })}
        // rowEvents={this.rowEvents}
      />
    );
  }
}

export const ModulePopup = (props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.isShowModule == false) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  const closeModal = () => {
    props.closeModalCallBack(false);
    setOpen(false);
  };

  return (
    <div>
      <Popup
        id={props.id}
        open={open}
        closeOnDocumentClick
        onClose={closeModal}
        repositionOnResize={true}
        position="center center"
      >
        <div className="modal">
          <button className="close" onClick={closeModal}>
            &times;
          </button>
          <div className="content">
            {props.module !== null &&
              props.module !== undefined &&
              props.module}
          </div>
        </div>
      </Popup>
    </div>
  );
};

export const AlertModulePopup = (props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log("AlertModulePopup props.isShowAlert =>", props.isShowAlert);
    if (props.isShowAlert == false) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  const closeModal = () => {
    props.closeAlertModalCallBack(false);
    setOpen(false);
  };

  return (
    <div>
      <Popup
        id={props.id}
        open={props.isShowAlert}
        closeOnDocumentClick
        onClose={closeModal}
        repositionOnResize={true}
        position="bottom left"
      >
        <div className="modal">
          <button className="close" onClick={closeModal}>
            &times;
          </button>
          <div className="content">{props.content}</div>
        </div>
      </Popup>
    </div>
  );
};

export const SimplePopup = (props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.isShowPopup == false) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  const closeModal = () => {
    props.closeAlertModalCallBack(false);
    setOpen(false);
  };
  return (
    <>
      <div>
        <Popup
          id={props.id}
          open={open}
          closeOnDocumentClick={props.closeOnDocumentClick}
          onClose={closeModal}
          repositionOnResize={true}
          position="center center"
          closeOnEscape={props.closeOnEsc}
          className={props.popupLvlClass ? props.popupLvlClass : "simplePopup"}
          nested={true}
        >
          <div className="modal">
            <button className="close" onClick={closeModal}>
              &times;
            </button>

            <div className="moduleContainer" id="moduleContainer">
              <div className="modalHeaderWithButtons">
                <div className="modalButtonContainer modalLeftSideHeader">
                  {props.headerButtonContainer && (
                    <div>{props.headerButtonContainer}</div>
                  )}
                </div>
                <div className="modalTitle">{props.title}</div>
                <div className="modalRightSideHeader"></div>
              </div>
              <div>{props.alertContainerBox}</div>
              <div className="content">{props.content}</div>
            </div>
          </div>
        </Popup>
      </div>
    </>
  );
};

export const ShortCutMenuPopup = (props) => {
  const [open, setOpen] = useState(false);
  const shortCutRef = useRef();

  useEffect(() => {
    if (props.isShowPopup == false) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  const closeModal = () => {
    // props.closeAlertModalCallBack(false);

    shortCutRef.current.close();
  };

  return (
    <div>
      <Popup
        ref={shortCutRef}
        trigger={
          <div className="menu-item circle-button">
            {" "}
            <AddIcon />{" "}
          </div>
        }
        position="bottom left"
        on="click"
        closeOnDocumentClick={true}
        mouseLeaveDelay={300}
        mouseEnterDelay={0}
        contentStyle={{ padding: "0px", border: "none" }}
        arrow={false}
        className="shortCutMenu"
        open={false}
      >
        {props.value && (
          <div className="shortCutMenuItems" onClick={closeModal}>
            {props.menuItems}
          </div>
        )}
      </Popup>
    </div>
  );
};

//#region AlertToolBox
export class AlertToolBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alertErrorMsgList: this.props.alertMsgList,
      alertErrorType: this.props.alertErrorType,
      isShowAlert: this.props.isShowAlert,
      errorClass: "",
    };
  }

  handleAlert = (msgType, isDisplayed) => {
    this.props.hideAlertCallBack(msgType, isDisplayed);
  };

  render() {
    let errorClass = this.state.errorClass;

    return (
      <div>
        {this.props.alertErrorType == "success" &&
        this.props.alertMsgList !== null &&
        this.props.alertMsgList.length > 0 ? (
          <SuccessAlert
            alertMsgList={this.props.alertMsgList}
            alertErrorType={this.props.alertErrorType}
            isShowAlert={this.props.isShowAlert}
            showAlertCallBack={this.handleAlert}
          />
        ) : (
          ""
        )}

        {this.props.alertErrorType == "danger" &&
        this.props.alertMsgList !== null &&
        this.props.alertMsgList.length > 0 ? (
          <DangerAlert
            alertMsgList={this.props.alertMsgList}
            alertErrorType={this.props.alertErrorType}
            isShowAlert={this.props.isShowAlert}
            showAlertCallBack={this.handleAlert}
          />
        ) : (
          ""
        )}
      </div>
    );
  }
}

export class SuccessAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alertMsgList: this.props.alertMsgList,
      alertErrorType: this.props.alertErrorType,
      isShowAlert: this.props.isShowAlert,
      errorClass: "",
    };
  }

  handleClearError = () => {
    this.props.showAlertCallBack(this.props.alertErrorType, false);
  };

  render() {
    let success_list = this.props.alertMsgList;

    if (success_list == null) {
      success_list = new Array();
    }
    return (
      <div>
        {this.props.isShowAlert && success_list !== null ? (
          <div className="successAlert">
            <ul>
              {success_list.map((success, index) => (
                <li key={index} className="successNotificationBar">
                  {success}
                </li>
              ))}
            </ul>
            {/* <span>{this.props.alertErrorMsg}</span> */}
            <span className="alert_btn_span">
              <Button id="successMsgId" onClick={() => this.handleClearError()}>
                Clear
              </Button>
            </span>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export class DangerAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alertMsgList: this.props.alertMsgList,
      alertErrorType: this.props.alertErrorType,
      isShowAlert: this.props.isShowAlert,
      errorClass: "",
    };
  }

  handleClearError = () => {
    this.props.showAlertCallBack(this.props.alertErrorType, false);
  };

  render() {
    let error_list = this.props.alertMsgList;

    if (error_list == null) {
      error_list = new Array();
    }
    return (
      <div>
        {this.props.isShowAlert && error_list !== null ? (
          <div className="dangerAlert" id="dangerAlert">
            <ul>
              {error_list.map((error, index) => (
                <li key={index} className="dangerNotificationBar">
                  {error}
                </li>
              ))}
            </ul>
            {/* <span>{this.props.alertErrorMsg}</span> */}
            <span className="alert_btn_span">
              <Button id="successMsgId" onClick={() => this.handleClearError()}>
                Clear
              </Button>
            </span>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export const MultiViewPopup = (props) => {
  const [open, setOpen] = useState(false);
  //const modulePopupRef = useRef();
  const modulePopupCloseBtnRef = useRef(null);
  const modulePopupCloseInputRef = useRef(null);
  useEffect(() => {
    if (props.isShowPopup == false) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  const Loader = (props) => {
    let progressText = "Loading ...";
    if (!!props.loadingText) {
      progressText = props.loadingText;
    }

    return (
      <div className="popup_loader">
        <div className="loaderText">
          <span>{progressText}</span>
          <div class="spinner"></div>
        </div>
      </div>
    );
  };

  const closeModal = () => {
    if (modulePopupCloseInputRef.current) {
      modulePopupCloseInputRef.current.focus();
    }
    if (
      props.isModulePopup
        ? props.closeModalCallBack(false)
        : props.closeAlertModalCallBack(false)
    );

    setOpen(false);
    focusCloseInput();
  };

  const focusCloseInput = () => {
    setTimeout(() => {
      let lvlClass = props.popupLvlClass
        ? props.popupLvlClass + "-content"
        : "simplePopup-content";
      console.log("lvlClass", lvlClass);

      let popupContents = document.querySelectorAll(
        ".popup-content > .testSpan > .modal > .popupCloseInput"
      );
      console.log("popupContents", popupContents);
      if (popupContents != undefined && popupContents != null) {
        let finalPopup = popupContents[popupContents.length - 1];
        if (finalPopup != undefined && finalPopup != null) {
          finalPopup.focus();
        }
      }
    }, 100);
  };

  const onKeyDown = (e) => {
    console.log("onKeyDown");

    if (e.keyCode == 27) {
      if (modulePopupCloseBtnRef.current) {
        console.log("onKeyDown");
        modulePopupCloseBtnRef.current.click();
      }
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      //closeModal(e);
      focusCloseInput();
    }
  };

  return (
    <>
      <div className="testForPopup">
        <Popup
          //ref={modulePopupRef}
          id={props.id}
          open={open}
          // closeOnDocumentClick={props.closeOnDocumentClick}
          // onClose={closeModal}
          repositionOnResize={true}
          position="center center"
          closeOnEscape={false}
          // className="simplePopup"
          className={props.popupLvlClass ? props.popupLvlClass : "simplePopup"}
          // className={className}
          // className="searchLookup"
          nested={true}
          disabled={props.disabled}
          //onOpen={onOpen}
        >
          <span className="testSpan" onKeyDown={onKeyDown}>
            <div className="modal">
              <input
                className="popupCloseInput"
                name="popupCloseInput"
                ref={modulePopupCloseInputRef}
              ></input>
              <button
                ref={modulePopupCloseBtnRef}
                className="close"
                onClick={closeModal}
              >
                &times;
              </button>

              {props.isModulePopup ? (
                <div className="content">
                  {props.module !== null &&
                    props.module !== undefined &&
                    props.module}
                </div>
              ) : (
                <div className="moduleContainer" id="moduleContainer">
                  <div className="modalHeaderWithButtons">
                    <div className="modalButtonContainer modalLeftSideHeader">
                      {props.headerButtonContainer && (
                        <div>{props.headerButtonContainer}</div>
                      )}
                    </div>
                    <div className="modalTitle">{props.title}</div>
                    {props.isLoading ? (
                      <Loader loadingText={props.loadingText} />
                    ) : null}

                    <div className="modalRightSideHeader"></div>
                  </div>
                  <div>{props.alertContainerBox}</div>

                  <div className="content">{props.content}</div>
                </div>
              )}

              {props.isLookup ? (
                <div>
                  {/* <input
                    className="popupCloseInput"
                    name="popupCloseInput"
                    ref={modulePopupCloseInputRef}
                  ></input>
                  <button className="close" onClick={closeModal}>
                    &times;
                  </button> */}

                  <div className="content">
                    {props.headercontent}
                    {props.paginationContent}
                    {props.resultContent}
                  </div>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </span>
        </Popup>
      </div>
    </>
  );
};

export const MultiViewPopup_bkup_15Jun2022 = (props) => {
  const [open, setOpen] = useState(false);
  //const modulePopupRef = useRef();
  const modulePopupCloseBtnRef = useRef(null);
  const modulePopupCloseInputRef = useRef(null);
  useEffect(() => {
    if (props.isShowPopup == false) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  const closeModal = () => {
    if (modulePopupCloseInputRef.current) {
      modulePopupCloseInputRef.current.focus();
    }
    if (
      props.isModulePopup
        ? props.closeModalCallBack(false)
        : props.closeAlertModalCallBack(false)
    );

    setOpen(false);
    focusCloseInput();
  };

  const focusCloseInput = () => {
    setTimeout(() => {
      let popupContents = document.querySelectorAll(
        ".simplePopup-content > .testSpan > .modal > .popupCloseInput"
      );

      if (popupContents != undefined && popupContents != null) {
        let finalPopup = popupContents[popupContents.length - 1];
        if (finalPopup != undefined && finalPopup != null) {
          finalPopup.focus();
        }
      }
    }, 100);
  };

  const onKeyDown = (e) => {
    console.log("onKeyDown");

    if (e.keyCode == 27) {
      if (modulePopupCloseBtnRef.current) {
        console.log("onKeyDown");
        modulePopupCloseBtnRef.current.click();
      }
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      //closeModal(e);
      focusCloseInput();
    }
  };

  const onOpen = () => {
    console.log("onOpen props.isModulePopup =>", props.isModulePopup);
  };

  const onClick = () => {
    // focusCloseInput();
  };

  return (
    <>
      <div className="testForPopup">
        <Popup
          //ref={modulePopupRef}
          id={props.id}
          open={open}
          // closeOnDocumentClick={props.closeOnDocumentClick}
          // onClose={closeModal}
          repositionOnResize={true}
          position="center center"
          closeOnEscape={false}
          className={props.popupLvlClass ? props.popupLvlClass : "simplePopup"}
          nested={true}
          disabled={props.disabled}
          //onOpen={onOpen}
        >
          <span className="testSpan" onKeyDown={onKeyDown}>
            <div className="modal">
              <input
                className="popupCloseInput"
                name="popupCloseInput"
                ref={modulePopupCloseInputRef}
              ></input>
              <button
                ref={modulePopupCloseBtnRef}
                className="close"
                onClick={closeModal}
              >
                &times;
              </button>

              {props.isModulePopup ? (
                <div className="content">
                  {props.module !== null &&
                    props.module !== undefined &&
                    props.module}
                </div>
              ) : (
                <div className="moduleContainer" id="moduleContainer">
                  <div className="modalHeaderWithButtons">
                    <div className="modalButtonContainer modalLeftSideHeader">
                      {props.headerButtonContainer && (
                        <div>{props.headerButtonContainer}</div>
                      )}
                    </div>
                    <div className="modalTitle">{props.title}</div>
                    <div className="modalRightSideHeader"></div>
                  </div>
                  <div>{props.alertContainerBox}</div>
                  <div className="content">{props.content}</div>
                </div>
              )}
            </div>
          </span>
        </Popup>
      </div>
    </>
  );
};

export const ProgressBar = (props) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.isShowPopup == false) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  let progressText = props.progressLoadingText;
  return (
    <>
      <div className="progressBar">
        <Popup
          id={props.id}
          open={open}
          repositionOnResize={true}
          position="center center"
          closeOnEscape={false}
          className="progressBar"
          nested={true}
          disabled={props.disabled}
        >
          <div className="progressBarTitle">
            <span>{progressText}</span>
            <div class="progress-bar">
              <span class="bar">
                <span class="progress"></span>
              </span>
            </div>
          </div>
        </Popup>
      </div>
    </>
  );
};

export {
  InputTextbox,
  InputCheckbox,
  CollapseComponent,
  LookupDialog,
  PopupWindow,
  ShowError,
  ShowInfo,
  InputNumberTextbox,
};
