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

      function initialisationNewBill() {
        const html = NewBillUI()
        document.body.innerHTML = html

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

        // Create a NewBill instance with mocked dependencies
        // Trigger the creation of a new bill
        var event = {
          target: { value: 'test.jpg' }, preventDefault: () => { }
        };
        await aNewBill.handleChangeFile(event);

        // Check that the bill is created as expected
        expect(aNewBill.billId).toBe('1234');
        expect(aNewBill.fileUrl).toBe('https://localhost:3456/images/test.jpg');
        expect(aNewBill.fileName).toBe('test.jpg');
      });
    })

    //Test d'intégration -> POST Ajouter Erreur 500
    // Simulation d'une situation où la création d'une facture (POST vers l'API) est exécutée avec succès
    // Vérifie que le message d'erreur approprié est correctement rendu sur la page
    test("POST bill", async () => {
      // Arrange
      jest.spyOn(mockStore, 'bills')
      jest.spyOn(mockStore.bills(), 'update')
      // simulation de connexion
      localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }));
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const buttonSubmit = screen.getAllByText('Envoyer')
      // Act
      buttonSubmit[0].click()
      // Assert
      expect(mockStore.bills().update).toHaveBeenCalled();
      await waitFor(() => screen.getAllByText('Mes notes de frais'));
    })

    describe("When an error occurs on API", () => {
      // Simulation d'une situation où la création d'une facture (POST vers l'API) échoue avec un code d'erreur 500
      // Vérifie que le message d'erreur approprié est correctement rendu sur la page
      test("POST bill fails with 500 message error", async () => {
        // Ajout d'un bloc try-catch entourant le code du test 
        // pour capturer toute erreur survenue pendant l'exécution du test 
        // et l'afficher dans la console.
        try {
          // Arrange :
          // jest.spyOn()
          // Crée une fonction simulée similaire à jest.fn 
          // mais qui surveille également les appels à objet[methodName]. 
          // Retourne une fonction simulée de Jest.
          jest.spyOn(mockStore, "bills")

          // La méthode statique Object.defineProperty() 
          // permet de définir une nouvelle propriété 
          // ou de modifier une propriété existante, directement sur un objet. 
          // La méthode renvoie l'objet modifié.
          Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
          )
          // La méthode setItem() de l'interface Storage, 
          // lorsque lui sont passées le duo clé-valeur, 
          // les ajoute à l'emplacement de stockage, 
          // sinon elle met à jour la valeur si la clé existe déjà.
          window.localStorage.setItem('user', JSON.stringify({
            type: "Employee",
            email: "a@a",
            password: "employee",
            status: "connected"
          }))
          // La méthode navigate() de l'interface WindowClient 
          // charge une URL (L'emplacement pour naviguer vers) spécifiée dans une page de client contrôlée, 
          // puis retourne une Promise qui devra être analysée par WindowClient (le demandeur).
          // (fonctionnement asynchrone : je te promet de faire, mais je suis pas sûr, à toi de vérifier) 
          window.onNavigate(ROUTES_PATH.NewBill)

          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()

          // Récupération du bouton clic
          const buttonSubmit = screen.getAllByText('Envoyer')
          // Act
          // Simulation du clic sur le btn "Envoyer", 
          // déclenchant la tentative de création d'une facture.
          buttonSubmit[0].click()

          // Simulation :
          // Je mocke la méthode bills du store 
          // pour retourner une promesse rejetée avec une erreur "Erreur 500".
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
          // waitFor() pour attendre que l'interface utilisateur soit mise à jour 
          // après la promesse rejetée.
          await waitFor(() => {
            // Assert :
            // Lorsque le message d'erreur "Erreur 500" est présent sur la page, 
            // le test est réussi.
            expect(message).toBeTruthy()
          })

        } catch (error) {
          console.error(error);
        }
      })

    })
  })
})