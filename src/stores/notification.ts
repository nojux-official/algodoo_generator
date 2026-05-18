import { defineStore } from 'pinia';
import { ref, readonly } from 'vue'
import type { Notification } from '@/interfaces/notification';

export const useNotificationStore = defineStore('notificationStore', () => {
    const items = ref<Notification[]>([])
    const nextId = ref(0)
    

    function createNewItem(item: Notification) {
        if(!item) return;
        if(findIndexByMessage(item.message) !== -1) return
        if(String(item.message).toLowerCase().includes('network') && hasNetworkError()) return;
        

        item.id = nextId.value
        nextId.value++

        items.value.push(item);
        return item
    }

    function updateItem(id: number, item: Notification) {
        if (!id || !item) return;

        const index = findIndexById(id);
        if (index !== undefined) {
            items.value[index] = item;
        }
    }

    function deleteItem(id: number) {
        const index = findIndexById(id);
        if (index === -1) return;
        items.value.splice(index, 1);
    }

    function findIndexById(id: number) {
        return items.value.findIndex((item) => item.id === id);
    }

    function findIndexByMessage(message: string){
        return items.value.findIndex((item) => String(item.message).trim() === String(message).trim())
    }

    function findItemById(id: number) {
        return items.value.find((item) => item.id === id);
    }

    function hasNetworkError() {
        return items.value.some(item => item.type === 'error' && String(item.message).toLowerCase().includes('network'))
    }

    return { createNewItem, updateItem, deleteItem, findItemById, notifications: readonly(items) }
    
})