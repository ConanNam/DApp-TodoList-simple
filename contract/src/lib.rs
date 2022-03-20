

// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::{near_bindgen, setup_alloc};
use std::option::Option::{Some, None};
use std::vec::Vec;
use near_sdk::serde::{Deserialize, Serialize};
setup_alloc!();


#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Task {
    message: String,
    created_at: u64,
    is_done: u8,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    to_dos: UnorderedMap<String, Vec<Task>>,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            to_dos: UnorderedMap::new(b"td".to_vec()),
        }
    }
}
#[near_bindgen]
impl Contract {
    pub fn create_task(&mut self, account_id: String, message: String, created_at: u64) {
        let task = Task {
            message,
            created_at,
            is_done: 0,
        };
        match self.to_dos.get(&account_id) {
            Some(mut tasks) => {
                tasks.push(task);
                self.to_dos.insert(&account_id, &tasks);
            }
            None => {
                let mut vec = Vec::new();
                vec.push(task);
                self.to_dos.insert(&account_id, &vec);
            }
        }
    }

    pub fn update_task(
        &mut self,
        _account_id: String,
        _message: String,
        _created_at: u64,
        _is_done: u8,
        _id_task: usize,
    ) -> bool {
        match self.to_dos.get(&_account_id) {
            Some(mut tasks) => {
                assert!(_message.trim().len() > 0, "Task is not null");
                let task = Task {
                    message: _message,
                    is_done: _is_done,
                    created_at: _created_at,
                };
                tasks[_id_task.to_owned()] = task;
                self.to_dos.insert(&_account_id, &tasks);
                true
            }
            None => false,
        }
    }

    pub fn del_task(&mut self, _account_id: String, _id_task: usize) -> bool {
        match self.to_dos.get(&_account_id) {
            Some(mut tasks) => {
                tasks.remove(_id_task);
                self.to_dos.insert(&_account_id, &tasks);
                true
            }
            None => false,
        }
    }

    pub fn get_all_tasks(&self, _account_id: String) -> Vec<Task> {
        match self.to_dos.get(&_account_id) {
            Some(taks) => taks,
            None => vec![],
        }
    }
}

