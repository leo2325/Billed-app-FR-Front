/**
 * @jest-environment jsdom
 */


import {screen, waitFor} from "@testing-library/dom"
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH } from "../constants/routes.js";

jest.mock("../app/store", () => mockStore)
$.fn.modal = jest.fn(); //<- dû à la fonction de bootstrap non reconnnu par Jest

  function initialisationBills(){
    document.body.innerHTML = BillsUI({ data: bills })

    //Simuler onNavigate
    const onNavigate = jest.fn(()=>{})

    //Simuler store
    const store = mockStore

    //Crer un user 
    const userObj = {
      type:"Employee",
      email:"employee@test.tld",
      password:"employee",
      status:"connected"
    }

    //Simuler localStore avec le user dedans 
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify(userObj))

    //Creation of Bills
    return new Bills({document, onNavigate, store, localStorage })
  }
  
  describe("Given I am connected as an employee", () => {
    let theBills;

    beforeAll(() => {
      theBills = initialisationBills();
    });

  describe("When I am on Bills Page", () => {
    let theBills;
    beforeEach(() =>{
      theBills = initialisationBills()
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})


describe("When click on eye-icon of a bill", ()=>{
  test("Then render a modal",async()=>{
    
    // console.log("innerHTML = ",document.body.innerHTML)
    
    const eye_icons = screen.getAllByTestId("icon-eye")
    
    userEvent.click(eye_icons[0])
    
    await waitFor(() =>{
      expect($('#modaleFile').find(".modal-body").innerHTML != '').toBe(true) // <---[ Verify si le justificatif est bien rendu dans le HTML ]
    })
    // console.log("innerHTML = ",document.body.innerHTML)
  })
})

describe("When click on button 'Note de frais'", () => {
  let theBills;

  beforeAll(() => {
    theBills = initialisationBills();
  });

  test("Then handleClickNewBill is called", () => {
    const handleClickNewBill = jest.fn(theBills.handleClickNewBill);
    const button = screen.getByTestId('btn-new-bill');
    button.addEventListener('click', handleClickNewBill);
    userEvent.click(button);

    expect(handleClickNewBill).toHaveBeenCalled();
    handleClickNewBill.mockRestore();
  });
});
