<template>
  <div class="login-page">
    <div class="left">
      <div class="company-name">
        <h1>PT. BMJ</h1>
        <h4>Apps</h4>
      </div>
    </div>
    <div class="right">
      <div class="login-form">
        <div class="title mb-4">
          Login
        </div>
        <form>
          <div class="form form-group mb-3">
            <label for="email">Email</label><br>
            <input type="email" class="input form-control mt-2" v-model="user.email" placeholder="Email">
          </div>
          <div class="form form-group">
            <label for="password">Password</label><br>
            <div class="input-group mt-2">
              <input v-if="!isPassShow" type="password" class="input form-control" v-model="user.password"
                placeholder="Password">
              <input v-else type="text" class="input form-control" v-model="user.password" placeholder="Password">
              <span class="input input-group-text">
                <button type="button" @click="showHide()" class="showHideBtn">
                  <svg v-if="!isPassShow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-eye" viewBox="0 0 16 16">
                    <path
                      d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-eye-slash" viewBox="0 0 16 16">
                    <path
                      d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                    <path
                      d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                    <path
                      d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
          <div class="button">
            <button type="button" class="btn btn-signin" @click="login()">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['user', 'login', 'showHide', 'isPassShow'])

</script>

<style lang="scss" scoped>
$primary-color: black;


.login-page {
  width: 100%;
  background-color: #FFFFFF;
  height: 100vh;
  display: flex;

  .left {
    width: 28%;
    display: flex;
    padding: 5% 5%;

    h1 {
      font-size: 3.5vw;
    }

    h4 {
      font-size: 2vw;
    }
  }

  .right {
    width: 72%;
    background-color: $primary-color;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .login-form {
      width: 60%;

      .title {
        font-size: 3.5vw;
        display: flex;
        justify-content: flex-start;
      }

      .showHideBtn {
        background-color: transparent;
        border-color: transparent;
        display: flex;
      }

      .button {
        .btn {
          margin-top: 6%;
          width: 100%;
          color: white;
          border-color: white;
          padding: 1vh 0 1vh 0;
          font-weight: 500;
          color: white;
          font-size: 1.5vw;
          letter-spacing: 0.03vw;
        }

        .btn:hover {
          background-color: white;
          color: $primary-color;
        }
      }
    }
  }
}
</style>
