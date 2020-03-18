import LabelService from '@/services/label.service'

export const state = () => ({
  items: [],
  selected: [],
  loading: false
})

export const getters = {
  isLabelSelected(state) {
    return state.selected.length > 0
  },
  parentOptions(state) {
    const options = []
    const mappedArr = {}
    let mappedElem

    for (const item of state.items) {
      mappedArr[item.id] = item
      mappedArr[item.id].children = []
    }

    for (const id in mappedArr) {
      mappedElem = mappedArr[id]
      if (mappedElem.parent) {
        mappedArr[mappedElem.parent].children.push(mappedElem)
      } else {
        options.push(mappedElem)
      }
    }
    return options
  }
}

export const mutations = {
  setLabelList(state, payload) {
    state.items = payload
  },
  addLabel(state, label) {
    state.items.unshift(label)
  },
  deleteLabel(state, labelId) {
    state.items = state.items.filter(item => item.id !== labelId)
  },
  updateSelected(state, selected) {
    state.selected = selected
  },
  updateLabel(state, label) {
    const item = state.items.find(item => item.id === label.id)
    Object.assign(item, label)
  },
  resetSelected(state) {
    state.selected = []
  },
  setLoading(state, payload) {
    state.loading = payload
  }
}

export const actions = {
  getLabelList({ commit }, payload) {
    commit('setLoading', true)
    return LabelService.getLabelList(payload.projectId)
      .then((response) => {
        commit('setLabelList', response.data)
      })
      .catch((error) => {
        alert(error)
      })
      .finally(() => {
        commit('setLoading', false)
      })
  },
  createLabel({ commit }, data) {
    return LabelService.addLabel(data.projectId, data)
      .then((response) => {
        commit('addLabel', response.data)
      })
  },
  updateLabel({ commit }, data) {
    LabelService.updateLabel(data.projectId, data.id, data)
      .then((response) => {
        commit('updateLabel', response.data)
      })
      .catch((error) => {
        alert(error)
      })
  },
  deleteLabel({ commit, state }, projectId) {
    for (const label of state.selected) {
      LabelService.deleteLabel(projectId, label.id)
        .then((response) => {
          commit('deleteLabel', label.id)
        })
        .catch((error) => {
          alert(error)
        })
    }
    commit('resetSelected')
  },
  importLabels({ commit }, payload) {
    commit('setLoading', true)
    const formData = new FormData()
    formData.append('file', payload.file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const labels = JSON.parse(e.target.result)
      for (const label of labels) {
        LabelService.addLabel(payload.projectId, label)
          .then((response) => {
            commit('addLabel', response.data)
          })
      }
    }
    reader.readAsText(payload.file)
    commit('setLoading', false)
  },
  exportLabels({ commit }, payload) {
    commit('setLoading', true)
    LabelService.getLabelList(payload.projectId)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data)]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `project_${payload.projectId}_labels.json`)
        document.body.appendChild(link)
        link.click()
      })
      .catch((error) => {
        alert(error)
      })
      .finally(() => {
        commit('setLoading', false)
      })
  }
}
