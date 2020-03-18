<template>
  <v-select
    :value="value"
    :items="value"
    :item-text="itemText"
    :label="label"
    :prepend-icon="prependIcon"
    multiple
    hide-selected
  >
    <template v-slot:selection="{ attrs, item, select, selected }">
      <v-chip
        v-bind="attrs"
        :input-value="selected"
        :color="item.background_color"
        :text-color="textColor(item.background_color)"
        @click="select"
        @click:close="remove(item)"
        close
      >
        {{ item.text }}
      </v-chip>
    </template>
    <template v-slot:prepend-item>
      <v-treeview
        :value="value"
        :item-text="itemText"
        :items="items"
        :selection-type="selectionType"
        v-on:input="updateValue($event)"
        dense
        hoverable
        selectable
        return-object
        open-all
        open-on-click
      />
    </template>
    <template v-slot:no-data>
      <span />
    </template>
  </v-select>
</template>

<script>
import { idealColor } from '~/plugins/utils'

export default {
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    itemText: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => [],
      required: true
    },
    label: {
      type: String,
      default: 'Select...'
    },
    prependIcon: {
      type: String,
      default: ''
    },
    selectionType: {
      type: String,
      default: 'leaf'
    },
    value: {
      type: Array,
      default: () => [],
      required: true
    }
  },

  methods: {
    textColor(backgroundColor) {
      return idealColor(backgroundColor)
    },
    updateValue(value) {
      if (this.multiple) {
        this.$emit('input', value)
      } else {
        this.$emit('input', value.slice(-1))
      }
    },
    remove(label) {
      this.$emit('click:close', label)
    }
  }
}
</script>
