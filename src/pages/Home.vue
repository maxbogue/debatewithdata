<template>
  <div class="center">
    <h1>DebateWithData</h1>
    <h2 :class="$style.subTitle">
      A crowdsourced reference for the world's discussions.
    </h2>
    <hr />
    <h3>Have informed debates without writing your own research paper!</h3>
    <div class="block blue">
      <h3>Learn</h3>
      <ul>
        <li>Find a topic you want to know more about.</li>
        <li>Read key claims and their points to understand both sides.</li>
        <li>See what data supports each side.</li>
      </ul>
    </div>
    <div class="block pink">
      <h3>Talk</h3>
      <ul>
        <li>
          Find the claim(s) that best represents the disagreement you're having.
        </li>
        <li>Try to stay on the topic of one claim at a time.</li>
        <li>
          Use what you learn from DWD to strengthen your points with data.
        </li>
      </ul>
    </div>
    <div class="block green">
      <h3>Contribute</h3>
      <ul>
        <li>Add data that contributes to a discussion.</li>
        <li>
          Add claims you've encountered people making, regardless of whether you
          agree with them personally.
        </li>
        <li>
          Star any claims and points that you think are relevant, compelling,
          and supported by data.
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  metaInfo: {
    title: 'DebateWithData',
    titleTemplate: '',
  },
};
</script>

<style lang="scss" module>
.subTitle {
  margin: 0;
  font-weight: 300;
}
</style>
