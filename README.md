<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/128584234/25.2.4%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T519278)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
[![](https://img.shields.io/badge/💬_Leave_Feedback-feecdd?style=flat-square)](#does-this-example-address-your-development-requirementsobjectives)
<!-- default badges end -->

# DropDownBox for DevExtreme - How to Filter Data in a Nested DataGrid

This example demonstrates how to filter data in a [DataGrid](https://js.devexpress.com/Documentation/Guide/UI_Components/DataGrid/Getting_Started_with_DataGrid/) embedded in a [DropDownBox](https://js.devexpress.com/Documentation/Guide/UI_Components/DropDownBox/Getting_Started_with_DropDownBox/).

![DropDownBox filtering](./images/dropdownbox-filtering.gif)

Use the [onInput](https://js.devexpress.com/jQuery/Documentation/ApiReference/UI_Components/dxDropDownBox/Configuration/#onInput), [onOpened](https://js.devexpress.com/jQuery/Documentation/ApiReference/UI_Components/dxDropDownBox/Configuration/#onOpened), and [onClosed](https://js.devexpress.com/jQuery/Documentation/ApiReference/UI_Components/dxDropDownBox/Configuration/#onClosed) event handlers to filter the DataGrid, manage focus, and synchronize the selected value.

## Files to Review

- **Angular**
    - [app.component.html](Angular/src/app/app.component.html)
    - [app.component.ts](Angular/src/app/app.component.ts)
- **jQuery**
    - [index.js](jQuery/src/index.js)
    - [helpers.js](jQuery/src/helpers.js)
- **React**
    - [App.tsx](React/src/App.tsx)
- **Vue**
    - [DropDownBoxWithDataGrid.vue](Vue/src/components/DropDownBoxWithDataGrid.vue)
- **ASP.NET Core**
    - [Index.cshtml](ASP.NET%20Core/Views/Home/Index.cshtml)
    - [drop-down-box.js](ASP.NET%20Core/wwwroot/js/drop-down-box.js)

## Documentation

- [Getting Started with DropDownBox](https://js.devexpress.com/Documentation/Guide/UI_Components/DropDownBox/Getting_Started_with_DropDownBox/)
- [DropDownBox - Synchronize with the Embedded Element](https://js.devexpress.com/Documentation/Guide/UI_Components/DropDownBox/Synchronize_with_the_Embedded_Element/)
- [DataGrid - Remote Operations](https://js.devexpress.com/Documentation/Guide/UI_Components/DataGrid/Enhance_Performance_on_Large_Datasets/)

## More Examples

- [DropDownBox - Single Selection](https://js.devexpress.com/Demos/WidgetsGallery/Demo/DropDownBox/SingleSelection)
- [DropDownBox - Multi-Selection](https://js.devexpress.com/Demos/WidgetsGallery/Demo/DropDownBox/MultipleSelection)

<!-- feedback -->
## Does This Example Address Your Development Requirements/Objectives?

[<img src="https://www.devexpress.com/support/examples/i/yes-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-dropdownbox-filter-data-in-nested-widget&~~~was_helpful=yes) [<img src="https://www.devexpress.com/support/examples/i/no-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-dropdownbox-filter-data-in-nested-widget&~~~was_helpful=no)

(you will be redirected to DevExpress.com to submit your response)
<!-- feedback end -->
