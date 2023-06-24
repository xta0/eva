const {test} = require('./test-util')

module.exports = eva => {
    // test(eva,
    //   `
    //     (class Point null
    //         (begin
    //             (def constructor (self x y)
    //                 (begin
    //                     (set (prop self x) x)
    //                     (set (prop self y) y)
    //                 )
    //             )
    //             (def calc (self)
    //                 (+
    //                     (prop self x)
    //                     (prop self y)
    //                 )
    //             )
    //         )
    //     )
    //     (var p (new Point 10 20))
    //     ((prop p calc) p)
    //   `,
    // 30);
    // test inheritance
    test(eva,
        `
          (class Point null
                (begin
                    (def constructor (self x y)
                        (begin
                            (set (prop self x) x)
                            (set (prop self y) y)
                        )
                    )
                    (def calc (self)
                        (+
                            (prop self x)
                            (prop self y)
                        )
                    )
                )
          )
          (class Point3D Point
              (begin
                  (def constructor (self x y z)
                      (begin
                            ((prop (super Point3D) constructor) self x y)
                            (set (prop self z) z)
                      )
                  )
                  (def calc (self)
                      (+
                          ((prop (super Point3D) calc) self)
                          (prop self z)
                      )
                  )
              )
          )
          (var p (new Point3D 10 20 30))
          ((prop p calc) p)
        `,
      60);

    //   test(eva,
    //     `
    //         (class Point null
    //             (begin
    //                 (def constructor (self x y)
    //                     (begin
    //                         (set (prop self x) x)
    //                         (set (prop self y) y)
    //                     )
    //                 )
    //                 (def calc (self)
    //                     (+
    //                         (prop self x)
    //                         (prop self y)
    //                     )
    //                 )
    //             )
    //         )
    //       (class Point3D Point
    //         (begin

    //           (def constructor (this x y z)
    //             (begin
    //               ((prop (super Point3D) constructor) this x y)
    //               (set (prop this z) z)))

    //           (def calc (this)
    //             (+ ((prop (super Point3D) calc) this)
    //                (prop this z)))))

    //       (var p (new Point3D 10 20 30))

    //       ((prop p calc) p)

    //     `,
    //     60);
}