<template>
<div class="narrow">
  <h1>Guide</h1>
  <p>
    The goal of DebateWithData is to create a crowd-sourced reference for the
    debates that people have. Debates are represented by
    <strong>claims</strong>, which have points for and against them. Points are
    links to either other claims or to <strong>data</strong> objects, which
    represent specific data from a source. <strong>Topics</strong> facilitate
    discovery of the key claims for an area of debate.
  </p>

  <p>
    Please explore, add and edit content, and email <a
     href="mailto:feedback@debatewithdata.org"
     target="_blank">feedback@debatewithdata.org</a> with any feedback, bugs,
   features requests, or other suggestions that you have.
  </p>

  <h2>Data<a href="#data"></a></h2>
  <p>
    A data object consists of a source URL, a short description of the data
    that source provides, and other optional metadata. It can also contain a
    table of raw data and generate basic graphs from that data. The closer to
    the origin of the data the source is, the better.
  </p>

  <h2>Claims<a href="#claims"></a></h2>
  <p>
    In the real world, debates are often very broad in scope, which leads to a
    lot of confusion about exactly what positions each side is defending. To
    keep things cleaner here, debates are distilled down into one or more
    claims. A claim is a clear, simple statement about the world. It is
    defended by points for it, and attacked by points against it.
  </p>

  <h2>Points<a href="#points"></a></h2>
  <p>
    A point for or against a claim is either a link to another claim or a link
    to a data object. If a claim is the "what", its points are the "why" or "why
    not".
  </p>

  <h2>Logical Fallacies<a href="#fallacies"></a></h2>
  <p>
    It is very common in debates (especially verbal ones) for people to use
    arguments that contain well-known logical fallacies. They may look or feel
    relevant, but on closer inspection there is no logical connection between
    what they say and the correctness of the topic being discussed. This
    project allows users to flag these logic errors and display a warning about
    them. The supported fallacies are listed below.
  </p>

  <div v-for="[flag, data] in flags" :key="flag">
    <h3 :id="flag">
      <span>{{ data.name }}</span>
      <a :href="'#' + flag"
         :class="$style.anchor"
         class="fas fa-link"></a>
    </h3>
    <p :class="$style.links">
      <a v-for="[title, url] in data.links"
         :key="title"
         :href="url"
         target="_blank">{{ title }}</a>
    </p>
    <p v-html="data.desc"></p>
  </div>
</div>
</template>

<script>
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

import { FlagData } from '../../common/flag';

export default {
  computed: {
    flags: function () {
      let flagList = map(FlagData, (v, k) => [k, v]);
      return sortBy(flagList, ([, v]) => v.name);
    },
  },
};
</script>

<style lang="scss" module>
@import "../style/constants";

.anchor {
  visibility: hidden;
  color: $text-light-accent;
  font-size: 0.75em;

  &:hover {
    color: $text-dark;
  }
}

h3:hover .anchor {
  visibility: visible;
}

.links {
  margin: 0;
  font-size: 0.75em;
  font-weight: 400;

  > :not(:first-child)::before {
    content: ' | ';
  }
}
</style>
