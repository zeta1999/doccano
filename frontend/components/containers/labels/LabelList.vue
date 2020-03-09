<template>
  <v-data-table
    :value="selected"
    :headers="headers"
    :items="items"
    :search="search"
    :loading="loading"
    @input="updateSelected"
    loading-text="Loading... Please wait"
    item-key="id"
    show-select
  >
    <template v-slot:top>
      <v-text-field
        v-model="search"
        prepend-inner-icon="search"
        label="Search"
        single-line
        hide-details
        filled
      />
    </template>
    <template v-slot:item.text="{ item }">
      <v-edit-dialog>
        <span>{{ item.text }}</span>
        <template v-slot:input>
          <v-text-field
            :value="item.text"
            :rules="labelNameRules"
            @change="handleUpdateLabel({ id: item.id, text: $event })"
            label="Edit"
            single-line
          />
        </template>
      </v-edit-dialog>
    </template>
    <template v-slot:item.suffix_key="{ item }">
      <v-edit-dialog>
        <div>{{ item.suffix_key }}</div>
        <template v-slot:input>
          <v-select
            :value="item.suffix_key"
            :items="keys"
            @change="handleUpdateLabel({ id: item.id, suffix_key: $event })"
            label="Key"
          />
        </template>
      </v-edit-dialog>
    </template>
    <template v-slot:item.background_color="{ item }">
      <v-edit-dialog>
        <v-chip
          :color="item.background_color"
          :text-color="textColor(item.background_color)"
          dark
        >
          {{ item.background_color }}
        </v-chip>
        <template v-slot:input>
          <v-color-picker
            :value="item.backgroundColor"
            :rules="colorRules"
            @update:color="handleUpdateLabel({ id:item.id, background_color: $event.hex })"
            show-swatches
            hide-mode-switch
            width="800"
            mode="hexa"
            class="ma-2"
          />
        </template>
      </v-edit-dialog>
    </template>
    <template v-slot:item.parent="{ item }">
      <v-edit-dialog>
        <div>{{ parentName(item.parent) }}</div>
        <template v-slot:input>
          <v-select
            :value="item.parent"
            :items="parentCandidates(item)"
            @change="handleUpdateLabel({ id: item.id, parent: $event })"
            item-text="text"
            item-value="id"
            label="Parent"
          />
        </template>
      </v-edit-dialog>
    </template>
  </v-data-table>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { colorRules, labelNameRules } from '@/rules/index'
import { idealColor } from '~/plugins/utils'

export default {
  data() {
    return {
      search: '',
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: false,
          value: 'text'
        },
        {
          text: 'Shortkey',
          sortable: false,
          value: 'suffix_key'
        },
        {
          text: 'Color',
          sortable: false,
          value: 'background_color'
        },
        {
          text: 'Parent',
          sortable: false,
          value: 'parent'
        }
      ],
      colorRules,
      labelNameRules
    }
  },

  computed: {
    ...mapState('labels', ['items', 'selected', 'loading']),

    keys() {
      return 'abcdefghijklmnopqrstuvwxyz'.split('')
    }
  },

  created() {
    this.getLabelList({
      projectId: this.$route.params.id
    })
  },

  methods: {
    ...mapActions('labels', ['getLabelList', 'updateLabel']),
    ...mapMutations('labels', ['updateSelected']),

    handleUpdateLabel(payload) {
      const data = {
        projectId: this.$route.params.id,
        ...payload
      }
      this.updateLabel(data)
    },

    textColor(backgroundColor) {
      return idealColor(backgroundColor)
    },

    parentName(parentId) {
      return parentId ? this.items.find(item => item.id === parentId).text : ''
    },

    parentCandidates(label) {
      const items = this.items.filter(item => item.id !== label.id)
      items.unshift({ id: null, text: 'None' }) // represents a root label
      return items
    },

    customSort(items) {
      items.sort((a, b) => {
        return a.text < b.text ? -1 : 1
      })
      const sorted = items.filter(item => item.parent === null)
      const remaining = items.filter(item => item.parent !== null)
      while (remaining.length > 0) {
        const x = remaining.pop()
        const i = sorted.findIndex(item => item.id === x.parent)
        const found = i !== -1
        if (found) {
          sorted.splice(i + 1, 0, x)
        } else {
          remaining.unshift(x)
        }
      }
      return sorted
    },

    getPaddingSize(label) {
      let indentLevel = 0
      while (label.parent !== null) {
        const parent = this.items.find(item => item.id === label.parent)
        label = parent
        indentLevel += 1
      }
      return indentLevel
    }
  }
}
</script>
