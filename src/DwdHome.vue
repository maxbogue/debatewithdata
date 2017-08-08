<template>
<div class="center home">
  <h1>DebateWithData</h1>
  <h2>A crowdsourced reference for the world's discussions.</h2>
  <hr></hr>
  <h3>Have informed debates without writing your own research paper!</h3>
  <div class="guide bubble blue">
    <h3>Learn</h3>
    <ul>
      <li>Find a claim you want to know more about.</li>
      <li>Read the points for that claim to understand both sides of it.</li>
      <li>Dive into the sources to see the data behind each side.</li>
    </ul>
  </div>
  <div class="guide bubble red">
    <h3>Talk</h3>
    <ul>
      <li>If you find yourself in a discussion, find the claim that best
        represents the disagreement you're having.</li>
      <li>Try to stay on the topic of that specific claim.</li>
      <li>Use what you learn from the claim page to strengthen your points with
        data and call out the weaknesses in theirs.</li>
    </ul>
  </div>
  <div class="guide bubble green">
    <h3>Contribute</h3>
    <ul>
      <li>Add sources that contribute relevant data to a discussion. The closer
        to the origin of the data, the better.</li>
      <li>Add claims you've encountered people making, regardless of whether
        you agree with them personally.</li>
      <li>Star any claims and points that you think are relevant, compelling,
        and supported by data.</li>
    </ul>
  </div>
</div>
</template>

<script>
export default {};
</script>

<style scoped>
.home h1 {
  font-size: 48px;
  margin: 20px 0 8px;
}
.home h2 {
  font-size: 24px;
  font-weight: 400;
  margin: 8px 0;
}
.home h3 {
  font-size: 20px;
}
.guide {
  margin: 20px 0;
  text-align: left;
}
.guide > h3 {
  font-weight: bold;
  margin: 0 0 8px;
}
.guide ul {
  margin: 0;
  padding-left: 16px;
}
.guide li {
  margin-top: 4px;
}
</style>
