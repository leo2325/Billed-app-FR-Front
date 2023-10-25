/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { screen, waitFor } from "@testing-library/dom"
// import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore) // Mocking comportement de this.store

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("when upload file", () => {

      const mockDocument = document.createElement('div'); // Créez un élément DOM simulé
      const html = NewBillUI();
      mockDocument.innerHTML = html;

      function initialisationNewBill() {

        //Simuler onNavigate
        const onNavigate = jest.fn(() => { })

        //Simuler store
        const store = mockStore

        //Crer un user 
        const userObj = {
          type: "Employee",
          email: "employee@test.tld",
          password: "employee",
          status: "connected"
        }

        //Simuler localStore avec le user dedans 
        Object.defineProperty(window, 'localStorage', { value: localStorageMock }) //<-- A voir JS
        window.localStorage.setItem('user', JSON.stringify(userObj))

        //Création d'un nouveau NewBill
        return new NewBill({ document, onNavigate, store, locaStore: window.localStorage })
      }

      //Déclaration de newbill à utiliser
      let aNewBill
      beforeEach(() => {
        aNewBill = initialisationNewBill()
      });

      test("Then the file is an extension png or jpeg or jpg", () => {
        const fileInput = screen.getByTestId('file');
        const file = new File(['dummy file'], 'test.jpg', { type: 'image/jpg' });
        const event = new Event('change', { bubbles: true });
      
        // Espionnez la méthode handleAlert
        const handleAlertSpy = jest.spyOn(aNewBill, 'handleAlert');
      
        Object.defineProperty(fileInput, 'files', {
          value: [file]
        });
      
        fileInput.dispatchEvent(event);
      
        // Vérifiez que handleAlert a été appelé avec le message approprié
        expect(handleAlertSpy).toHaveBeenCalledWith('Veuillez choisir un fichier avec une extension jpg, jpeg ou png.');
      
        // Nettoyer l'espion après le test
        handleAlertSpy.mockRestore();
      });

      test("Then the file don't accept other extention than png or jpeg or jpg ", () => {
        spyOn(window, 'alert');
        const fileInput = screen.getByTestId('file')
        //Création d'un fichier test en jpg
        const file = new File(['dummy file'], 'test.pdf', { type: 'application/pdf' })
        const event = new Event('change', { bubbles: true })
        Object.defineProperty(fileInput, 'files', {
          value: [file]
        })
        fileInput.dispatchEvent(event)
        
        expect(window.alert).toHaveBeenCalledWith('Veuillez choisir un fichier avec une extension jpg, jpeg ou png.');
        expect(fileInput.value).toBe('')
      })



      test("Create a new bill and handle the response", async () => {
        // Mock dependencies
        const mockStore = {
          bills: () => ({
            create: jest.fn(() => Promise.resolve({ fileUrl: 'test-url', key: 'test-key' })),
          }),
        };
        const mockFormData = new FormData();
        const mockFile = new File(['dummy file'], 'test.jpg', { type: 'image/jpg' });
        const mockUser = {
          email: "test@example.com",
        };
      
        // Create a NewBill instance with mocked dependencies
        const newBill = new NewBill({
          document: mockDocument,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: { getItem: jest.fn(() => JSON.stringify(mockUser)) },
        });
      
        // Trigger the creation of a new bill
        await newBill.handleChangeFile({ target: { value: 'test.jpg' } });
      
        // Check that the bill is created as expected
        expect(mockStore.bills().create).toHaveBeenCalledWith({
          data: mockFormData,
          headers: { noContentType: true },
        });
        expect(newBill.billId).toBe('test-key');
        expect(newBill.fileUrl).toBe('test-url');
        expect(newBill.fileName).toBe('test.jpg');
      });
    })

    //Test d'intégration -> POST Ajouter Erreur 500
    test("POST bill", async () => {
      localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "a@a"
      }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getAllByText("Envoyer"))
    })

    describe("When an error occurs on API", () => {
      test("POST bill fails with 500 message error", async () => {
        try {
          jest.spyOn(mockStore, "bills")

          Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
          )

          window.localStorage.setItem('user', JSON.stringify({
            type: "Employee",
            email: "a@a",
            password: "employee",
            status: "connected"
          }))

          window.onNavigate(ROUTES_PATH.NewBill)

          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()

          const buttonSubmit = screen.getAllByText('Envoyer')
          buttonSubmit[0].click()

          mockStore.bills.mockImplementationOnce(() => {
            return {
              create: (bill) => {
                return Promise.reject(new Error("Erreur 500"))
              }
            }
          })

          window.onNavigate(ROUTES_PATH.NewBill)
          await new Promise(process.nextTick);
          const message = screen.queryByText(/Erreur 500/)
          await waitFor(() => {
            expect(message).toBeTruthy()
          })

        } catch (error) {
          console.error(error);
        }
      })

    })
  })
})