/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import TodoListJSON from '../../build/contracts/TodoList.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(true);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>();
  const [tasks, setTasks] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.currentTarget.value);
  };

  const handleAddTask = async () => {
    if (contract && account) {
      await contract.createTask(input, { from: account });
      setInput('');
      setRefresh(true);
    }
  };

  const handleToggled = async (id: number) => {
    if (contract && account) {
      await contract.toggleCompleted(id, { from: account });
      setRefresh(true);
    }
  };

  const load = async () => {
    const addressAccount = await loadEthereumAccount();
    console.log("Cuenta obtenida en load:", addressAccount);

    const { todoContract, tasks } = await loadContract(addressAccount);
    console.log("Contrato cargado:", todoContract);
    console.log("Tareas cargadas:", tasks);

    return {addressAccount, todoContract, tasks};
  };

  const loadEthereumAccount: any = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // Solicitar acceso a las cuentas si aún no se ha concedido
        await provider.send("eth_requestAccounts", []);
        
        // Obtener el signer y la dirección de la cuenta
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Actualizar el estado con la cuenta (si es necesario)
        setAccount(address); 
  
        // Devolver la dirección de la cuenta por si quieres usarla
        return address;
      } catch (error) {
        console.error("Error al conectar o obtener la cuenta:", error);
      }
    } else {
      console.log('Navegador no compatible con Ethereum. Considera instalar MetaMask.');
    }
    return null;
  };

  const loadContract = async (addressAccount: string) => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Crear instancia del contrato utilizando ethers.js
        const todoContract = new ethers.Contract(
          TodoListJSON.networks[5777].address, // Dirección del contrato desplegado
          TodoListJSON.abi, // ABI del contrato
          signer // El signer que permite hacer transacciones
        );

        console.log("CONTRATO DESPLEAGADOOOO: ",todoContract)

        // Cargar las tareas
        const tasks = await loadTasks(todoContract, addressAccount);
        setTasks(tasks); // Actualiza el estado con las tareas cargadas
        return { todoContract, tasks };
      } catch (error) {
        console.error("Error al cargar el contrato:", error);
      }
    }
    return { todoContract: null, tasks: [] };
  };

  // Cargar las tareas del contrato
  const loadTasks = async (todoContract: ethers.Contract, addressAccount: string) => {
    const tasksCount = await todoContract.tasksCount(addressAccount);
    
    const tasksCountNumber = parseInt(tasksCount, 10); 
    const tasks = [];
    
    for (let i = 0; i < tasksCountNumber; i++) {
      const task = await todoContract.tasks(addressAccount, i);
      tasks.push(task);
    }
    return tasks;
  };

  useEffect(() => {
    if (!refresh) return;
    setRefresh(false);
    load().then((result) => {
      // console.log("Account:", result.addressAccount);
      // console.log("Contract:", result.todoContract);
      // console.log("Tasks:", result.tasks);
      setAccount(result.addressAccount);
      setTasks(result.tasks);
      setContract(result.todoContract);
    }).catch((error) => {
      console.error("Error en load:", error);
    });
  }, [refresh]);

  return (
    <>
      <main className="w-screen h-screen flex items-center justify-center">
        <div className="w-[800px] h-[600px]  bg-black border-[1px] rounded-xl p-5">
          <h2 className="text-2xl font-bold mb-6 text-center text-white ">Blockchain TodoList</h2>
          <div className="w-full flex flex-col justify-center items-center gap-7">
            <div className="w-[600px] flex flex-col gap-5">
              <div className="w-full flex gap-5">
                <input 
                  type="text" 
                  className="w-full pl-3 py-2 rounded-lg text-black font-semibold" 
                  placeholder="New Task"
                  onChange={handleInputChange}
                  value={input}
                />
                <button 
                  className="py-2 px-5 bg-green-500 rounded-md transition-colors duration-150 hover:bg-green-600"
                  onClick={handleAddTask}  
                >
                  <p className="text-white font-bold text-lg">Add</p>
                </button>
              </div>
              
              <div className="w-full flex flex-col items-center gap-3">
                <h2 className="text-white font-bold text-2xl">TODO</h2>
                <div className="w-full flex flex-col gap-4">
                  {tasks == null 
                    ? (
                      <div className="w-full h-full bg-red-50">
                        <div className="-spin h-5 w-5">HOLA MUNDO</div>
                      </div>
                    ) : (
                      tasks.map((task, index) => (
                          !task[2] ? (
                            <div key={index} className="flex gap-5">
                              <div className="w-full py-2 pl-3 bg-white rounded-lg">
                                <p>{task[1]}</p>
                              </div>
                              <button 
                                className="py-2 px-5 bg-green-500 rounded-md transition-colors duration-150 hover:bg-green-600 text-white font-bold text-lg"
                                onClick={() => handleToggled(Number(task[0]))}
                              >
                                DONE
                              </button>
                            </div>
                          ) : null
                      ))
                    )
                  }
                </div>
              </div>
              <div className="w-full flex flex-col items-center gap-3">
                <h2 className="text-white font-bold text-2xl">TASKS DONE</h2>
                <div className="w-full flex flex-col gap-4">
                  {tasks == null 
                    ? (
                      <div className="w-full h-full bg-red-50">
                        <div className="-spin h-5 w-5">HOLA MUNDO</div>
                      </div>
                    ) : (
                      tasks.map((task, index) => (
                        task[2] ? (
                          <div key={index} className="flex gap-5">
                            <div className="w-full py-2 pl-3 bg-white rounded-lg">
                              <p>{task[1]}</p>
                            </div>
                            <button 
                              className="py-2 px-5 bg-red-500 rounded-md transition-colors duration-150 hover:bg-red-600 text-white font-bold text-lg"
                              onClick={() => handleToggled(Number(task[0]))}
                            >
                              UNDONE
                            </button>
                          </div>
                        ) : null
                      ))
                    )
                  }
                </div>
              </div>
            </div>  
          </div>
        </div>
      </main>
    </>
  );
}
