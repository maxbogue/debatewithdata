<template>
  <div :class="$style.animation">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<style lang="scss" module>
@import '../style/constants';

$ball-size: 14px;
$translate-amount: 10px;

$c1: $pink-dark-primary;
$c2: $blue-dark-primary;
$c3: $purple-dark-primary;
$c4: $amber-dark-primary;
$c5: $green-dark-primary;
$ball-colors: $c1 $c2 $c3 $c4 $c5;

/* Negative delay so the balls do not start in a line. */
@function delay($interval, $count, $index) {
  @return ($index * $interval) - ($interval * $count);
}

@keyframes dwd-balls {
  0% {
    transform: translateY(-$translate-amount);
  }

  50% {
    transform: translateY($translate-amount);
  }

  100% {
    transform: translateY(-$translate-amount);
  }
}

@mixin dwd-balls($n) {
  @for $i from 1 through $n {
    > div:nth-child(#{$i}) {
      animation: dwd-balls 0.6s delay(0.08s, $n, $i) infinite ease-in-out;
      background-color: rgba(nth($ball-colors, $i), 0.8);
    }
  }
}

.animation {
  @include dwd-balls(5);

  display: inline-flex;
  align-items: center;
  padding: $translate-amount 0;

  > div {
    display: inline-block;
    width: $ball-size;
    height: $ball-size;
    margin: 3px;
    border-radius: 100%;
    background-color: $loader-color;
  }
}
</style>
