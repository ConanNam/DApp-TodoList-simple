import 'regenerator-runtime/runtime'
import React, { useEffect, useState } from 'react'
import { login, logout } from './utils'
import './global.css'
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import getConfig from './config'
import Big from 'big-js';
import { async } from 'regenerator-runtime/runtime';
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ModalUpdate from './components/Modal';


const { networkId } = getConfig(process.env.NODE_ENV || 'development')
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();



export default function App() {
  // use React Hooks to store greeting in component state
  const [tasks, setTasks] = React.useState([])
  console.log("🚀 ~ file: App.js ~ line 12 ~ App ~ tasks", tasks)
  const [todo, setTodo] = useState("");
  console.log("🚀 ~ file: App.js ~ line 24 ~ App ~ todo", todo)
  const [loading, setLoading] = useState(false)
  console.log("🚀 ~ file: App.js ~ line 22 ~ App ~ loading", loading)
  const [modalShow, setModalShow] = React.useState(false);
  const [canEdit, setCanEdit] = useState({})
  console.log("🚀 ~ file: App.js ~ line 28 ~ App ~ canEdit", canEdit)

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.get_all_tasks({ _account_id: window.accountId })
          .then(rs => {
            setTasks([...rs])
          })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  const handleDelete = async (_id_task) => {
    setLoading(true)
    try {
      await window.contract.del_task({
        _account_id: window.accountId,
        _id_task: _id_task,
      },
        BOATLOAD_OF_GAS,
        Big('0').times(10 ** 24).toFixed()
      ).then((rs) => {
        if (rs == true) {
          window.contract.get_all_tasks({ _account_id: window.accountId })
            .then(rs => {
              setTasks([...rs])
              setLoading(false)
            })
        } else {
          alert('del false')
        }
      })
    } catch (error) {
      console.log("🚀 ~ file: App.js ~ line 57 ~ handleDelete ~ error", error)

    }
  }

  const handleUpdate = async (item, index, tick = false) => {
    console.log("🚀 ~ file: App.js ~ line 70 ~ handleUpdate ~ item", item)
    setLoading(true)
    try {
      await window.contract.update_task({
        _account_id: window.accountId,
        _message: item.message,
        _created_at: item.created_at,
        _is_done: tick ? ( item.is_done == 1 ? 0 : 1) : item.is_done,
        _id_task: index,
      },
        BOATLOAD_OF_GAS,
        Big('0').times(10 ** 24).toFixed()
      ).then((rs) => {
        if (rs == true) {
          window.contract.get_all_tasks(
            { _account_id: window.accountId })
            .then(rs => {
              setTasks([...rs])
              setLoading(false)
            })
        } else {
          alert('del false')
        }
      })
    } catch (error) {
      console.log("🚀 ~ file: App.js ~ line 57 ~ update ~ error", error)

    }
  }

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEAR!</h1>
        <p>
          To make use of the NEAR blockchain, you need to sign in. The button
          below will sign you in using NEAR Wallet.
        </p>
        <p>
          By default, when your app runs in "development" mode, it connects
          to a test network ("testnet") wallet. This works just like the main
          network ("mainnet") wallet, but the NEAR Tokens on testnet aren't
          convertible to other currencies – they're just for testing!
        </p>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          {' '/* React trims whitespace around tags; insert literal space character when needed */}
          {window.accountId}!
        </h1>
        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { fieldset, todo } = event.target.elements
          // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
          const newTodo = todo.value

          // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // make an update call to the smart contract
            await window.contract.create_task({
              account_id: window.accountId,
              message: newTodo,
              created_at: new Date().getTime()
            },
              BOATLOAD_OF_GAS,
              Big('0').times(10 ** 24).toFixed())
              .then(() => {
                window.contract.get_all_tasks({ _account_id: window.accountId })
                  .then(rs => {
                    setTasks([...rs])
                  })
              })
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            //   // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }
          // update local `greeting` variable to match persisted value
        }}>
          <fieldset id="fieldset">
            <label
              htmlFor="todo"
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
              Tasks
            </label>
            <div style={{ display: 'flex' }}>
              <input
                autoComplete="off"
                defaultValue={todo}
                id="todo"
                onChange={e => {
                  setButtonDisabled(e.target.value === todo)
                }}
                style={{ flex: 1 }}
              />
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Save
              </button>
            </div>
          </fieldset>
        </form>
        <div style={{marginTop:30}}>
          <ul>
            {tasks.map((item, index) => {
              return (
                <li key={index}
                  style={item?.is_done == 1 ? { textDecoration: 'line-through' } : {}}
                >
                  <div>
                    <input type='checkbox'
                      checked={item.is_done == 1}
                      style={{ marginRight: 10 }}
                      onChange={() => handleUpdate(item, index,true)} />
                    {item?.message}, ngày tạo {new Date(item?.created_at).toLocaleDateString()}
                    <AiOutlineDelete onClick={() => {
                      console.log('delete')
                      handleDelete(index)
                    }} style={{ marginLeft: 50, marginRight: 10 }} />
                    <AiOutlineEdit onClick={() => {
                      console.log('update')
                      setCanEdit({item, index})
                      setModalShow(true)}} />
                  </div>
                </li>
              )
            })}
          </ul>
          
        </div>
        {loading &&
          <>
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="secondary" />
            <Spinner animation="grow" variant="success" />
            <Spinner animation="grow" variant="danger" />
            <Spinner animation="grow" variant="warning" />
            <Spinner animation="grow" variant="info" />
            <Spinner animation="grow" variant="light" />
            <Spinner animation="grow" variant="dark" />
          </>}
        <ModalUpdate
          show = {modalShow}
          onHide = {() => setModalShow(false)}
          item = {canEdit}
          onUpdate = {handleUpdate}
          />
      </main>
    </>
  )
}

// this component gets rendered by App after the form is submitted
