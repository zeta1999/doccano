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
    updateValue(value) {
      if (this.multiple) {
        this.$emit('input', value)
      } else {
        this.$emit('input', value.slice(-1))
      }
    }
  }
}
</script>
