<template>
  <v-card
    v-if="currentDoc && items"
    v-shortkey="multiKeys"
    @shortkey="handleShortkey"
  >
    <v-card-title>
      <hierarchical-classification
        v-model="annotatedLabels"
        :items="parentOptions"
        :multiple="true"
        @click:close="removeLabel"
        item-text="text"
        label="Label"
        selection-type="independent"
      />
    </v-card-title>
    <v-card-text class="title">
      {{ currentDoc.text }}
    </v-card-text>
  </v-card>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import HierarchicalClassification from '@/components/organisms/annotation/HierarchicalClassification'
Vue.use(require('vue-shortkey'))

export default {
  components: {
    HierarchicalClassification
  },

  computed: {
    ...mapState('labels', ['items']),
    ...mapGetters('labels', ['parentOptions']),
    ...mapGetters('documents', ['currentDoc']),
    multiKeys() {
      const multiKeys = {}
      for (const item of this.items) {
        multiKeys[item.id] = [item.suffix_key]
      }
      return multiKeys
    },
    annotatedLabels: {
      get() {
        const labelIds = this.currentDoc.annotations.map(item => item.label)
        return this.items.filter(item => labelIds.includes(item.id))
      },
      set(newValue) {
        const oldValue = this.annotatedLabels
        const diffA = newValue.filter(x => !oldValue.includes(x))
        const diffB = oldValue.filter(x => !newValue.includes(x))
        const diff = diffA.concat(diffB)
        this.changeLabels(diff)
      }
    }
  },

  created() {
    this.getLabelList({
      projectId: this.$route.params.id
    })
  },

  methods: {
    ...mapActions('labels', ['getLabelList']),
    ...mapActions('documents', ['getDocumentList', 'deleteAnnotation', 'updateAnnotation', 'addAnnotation']),
    removeLabel(label) {
      const annotation = this.currentDoc.annotations.find(item => item.label === label.id)
      const payload = {
        annotationId: annotation.id,
        projectId: this.$route.params.id
      }
      this.deleteAnnotation(payload)
    },
    addLabel(label) {
      const payload = {
        label: label.id,
        projectId: this.$route.params.id
      }
      this.addAnnotation(payload)
    },
    changeLabels(labels) {
      for (const label of labels) {
        this.addOrRemoveLabel(label)
      }
    },
    addOrRemoveLabel(label) {
      if (this.isAnnotatedLabel(label)) {
        this.removeLabel(label)
      } else {
        this.addLabel(label)
      }
    },
    handleShortkey(event) {
      const label = this.items.find(item => item.id === parseInt(event.srcKey, 10))
      this.addOrRemoveLabel(label)
    },
    isAnnotatedLabel(label) {
      const annotation = this.currentDoc.annotations.filter(item => item.label === label.id)
      return annotation.length !== 0
    }
  }
}
</script>
