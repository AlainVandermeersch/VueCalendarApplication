<template>
    <div class="col-full" :class="$style.centered">
        <h1 :class="$style.headingLarge">Not Found</h1>
        <p :class="$style.textLarge">Oops, Alain did not provide this information
            <router-link :to="{name: 'Calendar'}">
                Go Back to Calendar Page?
            </router-link>
        </p>
    </div>
</template>

<style module >
    .headingLarge {
        font-size: 100px;
    }
    .textLarge {
        font-size: 50px;
        font-weight: 100;
    }
    .centered {
        text-align: center;
    }
</style>