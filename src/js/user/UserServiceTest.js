(() => {

    describe("AngularJsCognito.UserService", () => {

        /**
         * Start
         * @param $q
         */
        function start($q) {
            let deferred = $q.defer();
            deferred.resolve(true);
            return deferred.promise;
        }

        let timestamp = Date.now();
        let testUser = {
            name: "Geoff Vader",
            username: "geoff.vader." + timestamp,
            email: "geoff.vader." + timestamp + "@test.aronim.com",
            password: "P@ssword123!"
        };

        let $q,
            userService,
            helloService,
            userServiceTestHelper;

        beforeAll(() => {
            angular
                .module("AngularJsCognito.UserServiceTest", [
                    "AngularJsCognito.UserService",
                    "AngularJsCognito.HelloService",
                    "AngularJsCognito.UserServiceTestHelper",
                    "ngMockE2E"
                ])
                .run(($httpBackend) => {
                    // Open up $httpBackend to allow AWS API calls through
                    $httpBackend.whenGET(/.*/).passThrough();
                    $httpBackend.whenPOST(/.*/).passThrough();
                });

            let $injector = angular.injector(["AngularJsCognito.UserServiceTest"]);
            $injector.invoke((_$q_, _userService_, _helloService_, _userServiceTestHelper_) => {
                $q = _$q_;
                userService = _userService_;
                helloService = _helloService_;
                userServiceTestHelper = _userServiceTestHelper_;
            })
        });

        let clearEmailQueue = (done => userServiceTestHelper.clearEmailQueue().then(done).catch(done));
        beforeAll(clearEmailQueue);
        afterAll(clearEmailQueue);

        let deleteUser = (done => userServiceTestHelper.deleteUser(testUser.username).then(done).catch(done));
        beforeEach(deleteUser);
        afterEach(deleteUser);

        let logout = () => userService.logout();
        beforeEach(logout);
        afterEach(logout);

        it("should register user", done => {

            // @formatter:off
            start($q)
                .then(()                    =>  userService.registerUser(testUser))
                .then((result)              =>      expect(result.message).toBe("Success"))

                .then(()                    =>  userServiceTestHelper.getUser(testUser.username))
                .then((user)                => {
                                                    expect(user.Enabled).toBeTruthy();
                                                    expect(user.UserStatus).toBe("UNCONFIRMED");
                })
                .then(()                    =>  userServiceTestHelper.getConfirmationCode(testUser.email))
                .then((confirmationCode)    =>  userService.confirmRegistration(testUser.username, confirmationCode))
                .then((result)              =>      expect(result.message).toBe("Success"))

                .then(()                    =>  userServiceTestHelper.getUser(testUser.username))
                .then((user)                => {
                                                    expect(user.Enabled).toBeTruthy();
                                                    expect(user.UserStatus).toBe("CONFIRMED");
                })
                .then(done)
                .catch(fail);
            // @formatter:on

        }, 30000);

        it("should authenticate user", done => {

            // @formatter:off
            start($q)
                .then(()                    =>  userService.registerUser(testUser))
                .then((result)              =>      expect(result.message).toBe("Success"))

                .then(()                    =>  userServiceTestHelper.getConfirmationCode(testUser.email))
                .then((confirmationCode)    =>  userService.confirmRegistration(testUser.username, confirmationCode))
                .then((result)              =>      expect(result.message).toBe("Success"))

                .then(()                    =>  userService.authenticateUser(testUser.username, testUser.password))
                .then((result)              =>      expect(result.message).toBe("Success"))

                .then(()                    =>  helloService.hello())
                .then((result)              =>      expect(result.message).toBe("Go Serverless v1.0! Your function executed successfully!"))
                .then(done)
                .catch(fail);
            // @formatter:on

        }, 30000);

        it("should reset password", done => {

            // @formatter:off
            start($q)
                .then(()                    =>  userService.registerUser(testUser))
                .then((result)              =>      expect(result.message).toBe("Success"))

                .then(()                    =>  userServiceTestHelper.getConfirmationCode(testUser.email))
                .then((confirmationCode)    =>  userService.confirmRegistration(testUser.username, confirmationCode))
                .then((result)              =>      expect(result.message).toBe("Success"))

                .then(()                    =>  userService.forgotPassword(testUser.username))
                .then((result)              =>      expect(result.message).toBe("InputVerificationCode"))

                .then(()                    =>  userServiceTestHelper.getConfirmationCode(testUser.email))
                .then((confirmationCode)    =>  userService.confirmPassword(testUser.username, testUser.password, confirmationCode))
                .then((result)              =>      expect(result.message).toBe("Success"))
                .then(done)
                .catch(fail);
            // @formatter:on

        }, 30000);

        it("should reset not reset password", done => {

            // @formatter:off
            start($q)
                .then(()                    =>  userService.registerUser(testUser))
                .then((result)              =>      expect(result.message).toBe("Success"))

                .then(()                    =>  userServiceTestHelper.getConfirmationCode(testUser.email))
                .then((confirmationCode)    =>  userService.confirmRegistration(testUser.username, confirmationCode))
                .then((result)              =>      expect(result.message).toBe("Success"))

                .then(()                    =>  userService.forgotPassword(testUser.username))
                .then((result)              =>      expect(result.message).toBe("InputVerificationCode"))

                .then((confirmationCode)    =>  userService.confirmPassword(testUser.username, testUser.password, "999999"))
                .then(fail)
                .catch((error)              => {
                                                    expect(error.message === "Invalid verification code provided, please try again.");
                                                    done();
                })
            // @formatter:on

        }, 30000);

        it("should logout", done => {

            // @formatter:off
            start($q)
                .then(()                    =>  userService.registerUser(testUser))
                .then((result)              =>      expect(result.message).toBe("Success"))
                
                .then(()                    =>  userServiceTestHelper.getConfirmationCode(testUser.email))
                .then((confirmationCode)    =>  userService.confirmRegistration(testUser.username, confirmationCode))
                .then((result)              =>      expect(result.message).toBe("Success"))
                
                .then(()                    =>  userService.authenticateUser(testUser.username, testUser.password))
                .then((result)              =>      expect(result.message).toBe("Success"))
                
                .then(()                    =>  helloService.hello())
                .then((result)              =>      expect(result.message).toBe("Go Serverless v1.0! Your function executed successfully!"))
                
                .then(()                    =>  userService.logout())
                .then(()                    =>  helloService.hello())
                .then(fail)
                .catch(done);
            // @formatter:on

        }, 30000);
    });
})();