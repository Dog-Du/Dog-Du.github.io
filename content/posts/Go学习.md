---
date: '2025-05-11T03:36:44.000Z'
tags:
- 已完成
- Go
- 学习
categories:
- 编程语言
title: Go学习
slug: lang-go-learn
summary: 从环境配置、模块管理到基础语法整理 Go 入门笔记，适合作为后续写后端前的速查清单。
commentTerm: "Go学习 | DogDu's blog"
commentDiscussionNumber: 23
lastmod: '2025-06-22T04:19:27.989Z'
---

这篇文章是我的 Go 入门整理，先记录环境配置和模块管理，再逐步补充语法与常用写法，方便之后做后端或刷题时快速回看。


<!--more-->

# 环境配置

环境变量：

![image-20250511113903776](/img/go%E5%AD%A6%E4%B9%A0/image-20250511113903776.webp)

备注：GOPROXY由于国内的网络环境，可以通过配置GOPROXY避免DNS污染导致的模块拉取缓慢或失败的问题，加速你的构建。  
`go env -w GOPROXY=https://goproxy.cn,direct`

或者

`export GOPROXY="https://goproxy.cn,direct"`

# 简单包管理

在代码中引入模块，如：

```go
package main

import (
    "github.com/valyala/fasthttp"
    "go.uber.org/zap"
)

var logger *zap.Logger

func init() {
    logger, _ = zap.NewProduction()
}

func fastHTTPHandler(ctx *fasthttp.RequestCtx) {
    logger.Info("hello, go module", zap.ByteString("uri", ctx.RequestURI()))
}

func main() {
    fasthttp.ListenAndServe(":8081", fastHTTPHandler)
}
```


然后在目录下: `go mod init <package_name>` 即可自动下载依赖，之后 `go build`即可

### init 函数：Go 包的初始化函数

除了前面讲过的 main.main 函数之外，Go 语言还有一个特殊函数，它就是用于**进行包初始化的 init 函数**了。

和 main.main 函数一样，init 函数也是一个无参数无返回值的函数。

init不能显示调用，

# 简单语法

## 变量声明：

![image-20250511210455481](/img/go%E5%AD%A6%E4%B9%A0/image-20250511210455481.webp)

类型的默认值

![image-20250511210508114](/img/go%E5%AD%A6%E4%B9%A0/image-20250511210508114.webp)

![image-20250511213342719](/img/go%E5%AD%A6%E4%B9%A0/image-20250511213342719.webp)

```go
// 变量声明块：
var (
    a int = 128
    b int8 = 6
    s string = "hello"
    c rune = 'A'
    t bool = true
)

// 多个变量一起声明：
var a, b, c int = 5, 6, 7

var (
    a, b, c int = 5, 6, 7
    c, d, e rune = 'C', 'D', 'E' // rune为处理utf-8字符集的数据类型
)

// 省略类型的变量声明：
var b = 13        // 类似C++: auto b = 13
var b = int32(13) // 指定类型。

var b // error，显然是错误的。

// 一个语句中声明多个不同类型的变量：
var a, b, c = 12, 'A', "hello"

// 短变量声明：
a := 12
b := 'A'
c := "hello"

a, b, c := 12, 'A', "hello"
```


变量类型：

* 包级变量：首大写导出，否则包内
* 局部变量：函数或者方法中的变量，仅内部可见。

小结论：**包级变量只能使用带有 var 关键字的变量声明形式，不能使用短变量声明形式，但在形式细节上可以有一定灵活度。**

```go
// $GOROOT/src/io/io.go
// 包级变量：多使用语法糖，省略类型信息
var ErrShortWrite = errors.New("short write")
var ErrShortBuffer = errors.New("short buffer")
var EOF = errors.New("EOF")

// 需要具体写出类型时：
// 第一种：
var a = 13         // 使用默认类型
var b int32 = 17   // 显式指定类型
var f float32 = 3.14 // 显式指定类型

// 第二种（更推荐，符合格式）：
var a = 13              // 使用默认类型
var b = int32(17)       // 显式指定类型
var f = float32(3.14)   // 显式指定类型

// 第三种（最推荐）：
var (
    a = 13
    b = int32(17)
    f = float32(3.14)
)

// 第四种（不太推荐）：
var (
    a = 13
    b int32 = 17
    f float32 = 3.14
)

// 声明，但是延迟初始化。
var a int32
var f float64

// 把延迟初始化放在一起，其他的放在一起。
// $GOROOT/src/net/net.go
var (
    netGo  bool
    netCgo bool
)

var (
    aLongTimeAgo = time.Unix(1, 0)
    noDeadline   = time.Time{}
    noCancel     = (chan struct{})(nil)
)

// 就近原则：声明的包级变量尽可能靠近用到的地方
// $GOROOT/src/net/http/request.go
var ErrNoCookie = errors.New("http: named cookie not present")

func (r *Request) Cookie(name string) (*Cookie, error) {
    for _, c := range readCookies(r.Header, name) {
        return c, nil
    }
    return nil, ErrNoCookie
}
```
局部变量声明：
```go
// 第一类：对于延迟初始化的局部变量声明，我们采用通用的变量声明形式
var err error

// 第二类：对于声明且显式初始化的局部变量，建议使用短变量声明形式
a := 17
f := 3.14
s := "hello, gopher!"

// 不接受默认类型的变量，我们依然可以使用短变量声明形式
a := int32(17)
f := float32(3.14)
s := []byte("hello, gopher!")

// 这里我们还要注意：尽量在分支控制时使用短变量声明形式。
// 如：
for i := len(s); i > 0; {
    r, size := utf8.DecodeLastRuneInString(s[:i])
    i -= size
    for _, c := range chars {
        if r == c {
            return i
        }
    }
}
return -1
```


![image-20250511212427442](/img/go%E5%AD%A6%E4%B9%A0/image-20250511212427442.webp)

## 代码块与作用域

```go
var a = 11

func foo(n int) {
    a := 1
    a += n
}

func main() {
    fmt.Println("a =", a) // 11
    foo(5)
    fmt.Println("after calling foo, a =", a) // 11
}

// 上面代码中，foo 并没有修改包级变量 a
```


![image-20250511212946671](/img/go%E5%AD%A6%E4%B9%A0/image-20250511212946671.webp)

**宇宙代码块（Universe Block）**，它囊括的范围最大，所有 Go 源码都在这个隐式代码块中。

**包代码块（Package Block）**，每个 Go 包都对应一个隐式包代码块，每个包代码块包含了该包中的所有 Go 源码，不管这些代码分布在这个包里的多少个的源文件中。

**文件代码块（File Block）**，每个 Go 源文件都对应着一个文件代码块，也就是说一个 Go 包如果有多个源文件，那么就会有多个对应的文件代码块。

**隐式代码块**就在控制语句层面了，包括 if、for 与 switch。我们可以把每个控制语句都视为在它自己的隐式代码块里。

**一个标识符的作用域就是指这个标识符在被声明后可以被有效使用的源码区域**。

**声明于外层代码块中的标识符，其作用域包括所有内层代码块**。

## 类型

![image-20250512205021589](/img/go%E5%AD%A6%E4%B9%A0/image-20250512205021589.webp)

平台相关：

![image-20250512205045466](/img/go%E5%AD%A6%E4%B9%A0/image-20250512205045466.webp)

Go的整数也是补码实现。

```go
// 字面量。
a := 53          // 十进制
b := 0700        // 八进制，以"0"为前缀
c1 := 0xaabbcc   // 十六进制，以"0x"为前缀
c2 := 0Xddeeff   // 十六进制，以"0X"为前缀
d1 := 0b10000001 // 二进制，以"0b"为前缀
d2 := 0B10000001 // 二进制，以"0B"为前缀
e1 := 0o700      // 八进制，以"0o"为前缀
e2 := 0O700      // 八进制，以"0O"为前缀

// 用下划线_ 分割增加可读性 (Go 1.13之后)
a := 5_3_7        // 十进制: 537
b := 0b_1000_0111 // 二进制位表示为10000111
c1 := 0_700       // 八进制: 0700
c2 := 0o_700      // 八进制: 0700
d1 := 0x_5c_6d    // 十六进制：0x5c6d

// 输出
var a int8 = 59
fmt.Printf("%b\n", a) // 输出二进制：111011
fmt.Printf("%d\n", a) // 输出十进制：59
fmt.Printf("%o\n", a) // 输出八进制：73
fmt.Printf("%O\n", a) // 输出八进制(带0o前缀)：0o73
fmt.Printf("%x\n", a) // 输出十六进制(小写)：3b
fmt.Printf("%X\n", a) // 输出十六进制(大写)：3B
```


浮点数（均为平台无关）：

![image-20250512205634216](/img/go%E5%AD%A6%E4%B9%A0/image-20250512205634216.webp)

Go中浮点数默认为`float64`

```go
// 浮点数字面量
3.1415
.15 // 整数部分如果为0，整数部分可以省略不写
81.80
82. // 小数部分如果为0，小数点后的0可以省略不写
6674.28e-2  // 6674.28 * 10^(-2) = 66.742800
.12345E+5   // 0.12345 * 10^5 = 12345.000000
0x2.p10     // 2.0 * 2^10 = 2048.000000
0x1.Fp+0    // 1.9375 * 2^0 = 1.937500

var f float64 = 123.45678
fmt.Printf("%f\n", f) // 123.456780
fmt.Printf("%e\n", f) // 1.234568e+02
fmt.Printf("%x\n", f) // 0x1.edd3be22e5de1p+06
```




```go
// 复数初始化。
var c = 5 + 6i
var d = 0o123 + .12345E+5i // 83+12345i

// 第二种，Go 还提供了 complex 函数，方便我们创建一个 complex128 类型值：
var c = complex(5, 6)            // 5 + 6i
var d = complex(0o123, .12345E+5) // 83+12345i

// 第三种，你还可以通过 Go 提供的预定义的函数 real 和 imag，
// 来获取一个复数的实部与虚部，返回值为一个浮点类型：
var c = complex(5, 6) // 5 + 6i
r := real(c)          // 5.000000
i := imag(c)          // 6.000000
```
自定义类型：
```go
type MyInt int32

var m int = 5
var n int32 = 6
var a MyInt = m       // 错误：在赋值中不能将m（int类型）作为MyInt类型使用
var a MyInt = n       // 错误：在赋值中不能将n（int32类型）作为MyInt类型使用
var a MyInt = MyInt(m) // ok
var a MyInt = MyInt(n) // ok
```
类型别名：
```go
type MyInt = int32

var n int32 = 6
var a MyInt = n // ok
```
字符串：
```go
const (
    GO_SLOGAN = "less is more" // GO_SLOGAN是string类型常量
    s1        = "hello, gopher" // s1是string类型常量
)
var s2 = "I love go" // s2是string类型变量
```


**string 类型的数据是不可变的，提高了字符串的并发安全性和存储利用率。**

Go 字符串可以被多个 Goroutine 共享，开发者不用因为担心并发安全问题，使用会带来一定开销的同步机制。

```go
var s string = "hello"
s[0] = 'k'   // 错误：字符串的内容是不可改变的
s = "gopher" // ok
```


**没有结尾’\0’，而且获取长度的时间复杂度是常数时间，消除了获取字符串长度的开销。**

**原生支持“所见即所得”的原始字符串，大大降低构造多行字符串时的心智负担。**

```go
var s string = `         ,_---~~~~~----._
     _,,_,*^____      _____*g*\"*,--,
    / __/ /'     ^.  /      \ ^@q   f
   [  @f | @))    |  | @))   l  0 _/
    \/   \~____ / __ \_____/     \
     \     |           _l__l_           I
      }    [______]           I
      ]     | | |            |
      ]      ~ ~             |
      |                      |
      |                      |`
fmt.Println(s)
```
**对非
ASCII
字符提供原生支持，消除了源码在不同环境下显示乱码的可能。**
```go
var s = "中国人"
fmt.Printf("the length of s = %d\n", len(s)) // 9->非ASCII字符占多个字节
for i := 0; i < len(s); i++ {
    fmt.Printf("0x%x ", s[i]) // 0xe4 0xb8 0xad 0xe5 0x9b 0xbd 0xe4 0xba 0xba
}
fmt.Printf("\n")
```


### rune 类型与字符字面值

Go 使用 rune 这个类型来表示一个 Unicode 码点。rune 本质上是 int32 类型的别名类型，它与 int32 类型是完全等价的，定义：

```go
// $GOROOT/src/builtin.go
type rune = int32
```


![image-20250512212043390](/img/go%E5%AD%A6%E4%B9%A0/image-20250512212043390.webp)

Go字符串的内部表示：

```go
// $GOROOT/src/reflect/value.go
// StringHeader是一个string的运行时表示
type StringHeader struct {
    Data uintptr
    Len  int
}
```


**string 类型其实是一个“描述符”，它本身并不真正存储字符串数据，而仅是由一个指向底层存储的指针和字符串的长度字段组成的。**

了解了 string 类型的实现原理后，我们还可以得到这样一个结论，那就是**我们直接将 string 类型通过函数 / 方法参数传入也不会带来太多的开销。**因为传入的仅仅是一个“描述符”，而不是真正的字符串数据。

下标索引：

```go
var s = "中国人"
for i := 0; i < len(s); i++ {
    fmt.Printf("index: %d, value: 0x%x\n", i, s[i])
}
```
输出：
```
index: 0, value: 0xe4
index: 1, value: 0xb8
index: 2, value: 0xad
index: 3, value: 0xe5
index: 4, value: 0x9b
index: 5, value: 0xbd
index: 6, value: 0xe4
index: 7, value: 0xba
index: 8, value: 0xba
```
字符迭代：
```go
var s = "中国人"
for i, v := range s {
    fmt.Printf("index: %d, value: 0x%x\n", i, v)
}
```
输出（与下标检索不一样）：
```
index: 0, value: 0x4e2d
index: 3, value: 0x56fd
index: 6, value: 0x4eba
```


按照unicode字符的码点输出。

通过 Go 提供的内置函数 len，我们只能获取字符串内容的长度（字节个数）。当然了，获取字符串中字符个数更专业的方法，是调用标准库 UTF-8 包中的 RuneCountInString 函数。

字符串连接：

```go
s := "Rob Pike, "
s = s + "Robert Griesemer, "
s += " Ken Thompson"
fmt.Println(s) // Rob Pike, Robert Griesemer, Ken Thompson
```


除了这个方法外，Go 还提供了 strings.Builder、strings.Join、fmt.Sprintf 等函数来进行字符串连接操作。

如果能知道拼接字符串的个数，那么使用`bytes.Buffer`和`strings.Builder`的`Grows`申请空间后，性能是最好的；如果不能确定长度，那么`bytes.Buffer`和`strings.Builder`也比“+”和`fmt.Sprintf`性能好很多。

`bytes.Buffer`与`strings.Builder`，`strings.Builder`更合适，因为`bytes.Buffer`转化为字符串时重新申请了一块空间，存放生成的字符串变量，而 `strings.Builder` 直接将底层的 []byte 转换成了字符串类型返回了回来。

bytes.Buffer 的注释中还特意提到了：

`To build strings more efficiently, see the strings.Builder type.`

字符串比较：

```go
func main() {
    // ==
    s1 := "世界和平"
    s2 := "世界" + "和平"
    fmt.Println(s1 == s2) // true

    // !=
    s1 = "Go"
    s2 = "C"
    fmt.Println(s1 != s2) // true

    // < and <=
    s1 = "12345"
    s2 = "23456"
    fmt.Println(s1 < s2)  // true
    fmt.Println(s1 <= s2) // true

    // > and >=
    s1 = "12345"
    s2 = "123"
    fmt.Println(s1 > s2)  // true
    fmt.Println(s1 >= s2) // true
}
```
字符串转换：
```go
var s string = "中国人"

// string -> []rune
rs := []rune(s)
fmt.Printf("%x\n", rs) // [4e2d 56fd 4eba]

// string -> []byte
bs := []byte(s)
fmt.Printf("%x\n", bs) // e4b8ade59bbde4baba

// []rune -> string
s1 := string(rs)
fmt.Println(s1) // 中国人

// []byte -> string
s2 := string(bs)
fmt.Println(s2) // 中国人
```


这样的转型看似简单，但无论是 string 转切片，还是切片转 string，这类转型背后也是有着一定开销的。这些开销的根源就在于 string 是不可变的，运行时要为转换后的类型分配新内存。

## 常量

* 支持无类型常量；
* 支持隐式自动转型；
* 可用于实现枚举。

```go
const Pi float64 = 3.14159265358979323846 // 单行常量声明

// 以const代码块形式声明常量
const (
    size int64 = 4096
    i, j, s = 13, 14, "bar" // 单行声明多个常量
)
```


**Go 常量的类型只局限于前面我们学过的 Go 基本数据类型，包括数值类型、字符串类型，以及只有两个取值（true 和 false）的布尔类型。**

无类型常量：

```go
// 错误：
type myInt int
const n myInt = 13
const m int = n + 5 // 编译器报错：cannot use n + 5 (type myInt) as type int in const initializer

func main() {
    var a int = 5
    fmt.Println(a + n) // 编译器报错：invalid operation: a + n (mismatched types int and myInt)
}

// 正确：
type myInt int
const n myInt = 13
const m int = int(n) + 5 // OK

func main() {
    var a int = 5
    fmt.Println(a + int(n)) // 输出：18
}
```


**即便两个类型拥有着相同的底层类型，但它们仍然是不同的数据类型，不可以被相互比较或混在一个表达式中进行运算。**

无类型：

```go
type myInt int
const n = 13

func main() {
    var a myInt = 5
    fmt.Println(a + n) // 输出：18
}
```


隐式转换：

隐式转型说的就是，对于无类型常量参与的表达式求值，Go 编译器会根据上下文中的类型信息，把无类型常量自动转换为相应的类型后，再参与求值计算，这一转型动作是隐式进行的。

```go
const m = 1333333333
var k int8 = 1
j := k + m // 编译器报错：constant 1333333333 overflows int8
```


这个代码中常量 m 的值 1333333333 已经超出了 int8 类型可以表示的范围，所以我们将它转换为 int8 类型时，就会导致编译器报溢出错误。

枚举实现：

**Go 的 const 语法提供了“隐式重复前一个非空表达式”的机制**

```go
const (
    Apple, Banana = 11, 22
    Strawberry, Grape
    Pear, Watermelon
)

// 等价于：
const (
    Apple, Banana = 11, 22
    Strawberry, Grape = 11, 22 // 使用上一行的初始化表达式
    Pear, Watermelon = 11, 22  // 使用上一行的初始化表达式
)
```
itoa：
```go
// $GOROOT/src/sync/mutex.go
const (
    mutexLocked = 1 << iota // 1
    mutexWoken              // 2
    mutexStarving           // 4
    mutexWaiterShift = iota // 3
    starvationThresholdNs = 1e6 // 1e6
)

const (
    Apple, Banana = iota, iota + 10 // 0, 10 (iota = 0)
    Strawberry, Grape               // 1, 11 (iota = 1)
    Pear, Watermelon                // 2, 12 (iota = 2)
)

const (
    _ = iota // 0，空白占位符
    Pin1
    Pin2
    Pin3
    _
    Pin5 // 5
)

const (
    _ = iota
    Blue
    Red
    Yellow
)
```


## 复合数据类型

Go 语言原生内置了多种复合数据类型，包括数组、切片（slice）、map、结构体，以及像 channel 这类用于并发程序设计的高级复合数据类型。

### 数组

Go 的数组类型包含两个重要属性：**元素的类型**和**数组长度**（元素的个数）。

`var arr [N]T`

**如果两个数组类型的元素类型 T 与数组长度 N 都是一样的，那么这两个数组类型是等价的，如果有一个属性不同，它们就是两个不同的数组类型。**

```go
func foo(arr [5]int) {}

func main() {
    var arr1 [5]int
    var arr2 [6]int
    var arr3 [5]string
    foo(arr1) // ok
    foo(arr2) // 错误：[6]int与函数foo参数的类型[5]int不是同一数组类型
    foo(arr3) // 错误：[5]string与函数foo参数的类型[5]int不是同一数组类型
}
```
![image-20250513104610566]
(/img/go%E5%AD%A6%E4%B9%A0/image-20250513104610566.webp)
```go
var arr = [6]int{1, 2, 3, 4, 5, 6}
fmt.Println("数组长度：", len(arr))           // 6
fmt.Println("数组大小：", unsafe.Sizeof(arr)) // 48

// 如果没有进行初始化，默认为零值。
var arr1 [6]int // [0 0 0 0 0 0]

var arr2 = [6]int{
    11, 12, 13, 14, 15, 16,
} // [11 12 13 14 15 16]

var arr3 = [...]int{ // 通过[...]自动计算出长度
    21, 22, 23,
} // [21 22 23]
fmt.Printf("%T\n", arr3) // [3]int

// 稀疏数组的初始化。
var arr4 = [...]int{
    99: 39, // 将第100个元素(下标值为99)的值赋值为39，其余元素值均为0
}
fmt.Printf("%T\n", arr4) // [100]int
```
数组的**下标值是从
0
开始的**。如果下标值超出数组长度范畴，或者是负数，那么
Go
编译器会给出错误提示，防止访问溢出：
```go
var arr = [6]int{11, 12, 13, 14, 15, 16}
fmt.Println(arr[0], arr[5]) // 11 16
fmt.Println(arr[-1])        // 错误：下标值不能为负数
fmt.Println(arr[8])         // 错误：小标值超出了arr的长度范围
```


### 多维数组

`var mArr [2][3][4]int`

在Go中，数组类型变量是一个整体，这就意味着一个数组变量表示的是整个数组。这点与 C 语言完全不同，在 C 语言中，数组变量可视为指向数组第一个元素的指针。这样一来，无论是参与迭代，还是作为实际参数传给一个函数 / 方法，Go 传递数组的方式都是纯粹的值拷贝，这会带来较大的内存拷贝开销。

这时，你可能会想到我们可以使用指针的方式，来向函数传递数组。没错，这样做的确可以避免性能损耗，但这更像是 C 语言的惯用法。**其实，Go 语言为我们提供了一种更为灵活、更为地道的方式 ，切片，来解决这个问题。**它的优秀特性让它成为了 Go 语言中最常用的同构复合类型。

### 切片

```go
var nums = []int{1, 2, 3, 4, 5, 6}
fmt.Println(len(nums)) // 6
nums = append(nums, 7) // 切片变为[1 2 3 4 5 6 7], append内置函数
fmt.Println(len(nums)) // 7
```




```go
type slice struct {
    array unsafe.Pointer
    len   int
    cap   int // cap->capacity, cap >= len.
}
// 类似于vector。
```


![image-20250513105805333](/img/go%E5%AD%A6%E4%B9%A0/image-20250513105805333.webp)

创建切片。

**方法一：通过 make 函数来创建切片，并指定底层数组的长度。**

```go
sl := make([]byte, 6, 10) // 其中10为cap值，即底层数组长度，6为切片的初始长度
// 如果没有在 make 中指定 cap 参数，那么底层数组长度 cap 就等于 len
sl := make([]byte, 6) // cap = len = 6
```
**方法二：采用
array[low
:
high
:
max]
（max可省）语法基于一个已存在的数组创建切片。这种方式被称为数组的切片化**
```go
arr := [10]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
sl := arr[3:7:9]
```
![image-20250513105744384]
(/img/go%E5%AD%A6%E4%B9%A0/image-20250513105744384.webp)
```go
sl[0] += 10
fmt.Println("arr[3] =", arr[3]) // 14
```


**切片好比打开了一个访问与修改数组的“窗口”**，通过这个窗口，我们可以直接操作底层数组中的部分元素。这有些类似于我们操作文件之前打开的“文件描述符”（Windows 上称为句柄），通过文件描述符我们可以对底层的真实文件进行相关操作。**可以说，切片之于数组就像是文件描述符之于文件。**

切片与数组最大的不同，就在于其长度的不定长，这种不定长需要 Go 运行时提供支持，这种支持就是切片的“动态扩容”。

#### 切片的动态扩容

```go
var s []int
s = append(s, 11)
fmt.Println(len(s), cap(s)) //1 1
s = append(s, 12)
fmt.Println(len(s), cap(s)) //2 2
s = append(s, 13)
fmt.Println(len(s), cap(s)) //3 4
s = append(s, 14)
fmt.Println(len(s), cap(s)) //4 4
s = append(s, 15)
fmt.Println(len(s), cap(s)) //5 8
```
不过
append
操作的这种自动扩容行为，有些时候会给我们开发者带来一些困惑，比如基于**一个已有数组建立的切片，一旦追加的数据操作触碰到切片的容量上限（实质上也是数组容量的上界)，切片就会和原数组解除“绑定”，后续对切片的任何修改都不会反映到原数组中了。**
```go
u := [...]int{11, 12, 13, 14, 15}
fmt.Println("array:", u) // [11, 12, 13, 14, 15]
s := u[1:3]
fmt.Printf("slice(len=%d, cap=%d): %v\n", len(s), cap(s), s) // [12, 13]
s = append(s, 24)
fmt.Println("after append 24, array:", u)
fmt.Printf("after append 24, slice(len=%d, cap=%d): %v\n", len(s), cap(s), s)
s = append(s, 25)
fmt.Println("after append 25, array:", u)
fmt.Printf("after append 25, slice(len=%d, cap=%d): %v\n", len(s), cap(s), s)
s = append(s, 26)
fmt.Println("after append 26, array:", u)
fmt.Printf("after append 26, slice(len=%d, cap=%d): %v\n", len(s), cap(s), s)
s[0] = 22
fmt.Println("after reassign 1st elem of slice, array:", u)
fmt.Printf("after reassign 1st elem of slice, slice(len=%d, cap=%d): %v\n", len(s), cap(s), s)
```




```
# 结果
array: [11 12 13 14 15]
slice(len=2, cap=4): [12 13]
after append 24, array: [11 12 13 24 15]
after append 24, slice(len=3, cap=4): [12 13 24]
after append 25, array: [11 12 13 24 25]
after append 25, slice(len=4, cap=4): [12 13 24 25]
after append 26, array: [11 12 13 24 25]
after append 26, slice(len=5, cap=8): [12 13 24 25 26]
after reassign 1st elem of slice, array: [11 12 13 24 25]
after reassign 1st elem of slice, slice(len=5, cap=8): [22 13 24 25 26]
```


显然，对于cap > len的切片，如果append，那么不会对原数组拷贝扩容，只会对数组的下一位进行修改而已。

原数组 u 的元素也不会发生改变了，因为这个时候切片 s 与数组 u 已经解除了“绑定关系”，s 已经不再是数组 u 的“描述符”了。这种因切片的自动扩容而导致的“绑定关系”解除，有时候会成为你实践道路上的一个小陷阱，你一定要注意这一点。

思考题：`var sl1 []int` 和 `var sl2 []int{}`区别。

相当于 `var sl2 []int{}`是已经初始化的，是空，但是非nil，但是前者是nil。

### map类型

map 是 Go 语言提供的一种抽象数据类型，它表示一组无序的键值对。在后面的讲解中，我们会直接使用 key 和 value 分别代表 map 的键和值。而且，map 集合中每个 key 都是唯一的：

![image-20250513113332824](/img/go%E5%AD%A6%E4%B9%A0/image-20250513113332824.webp)

```go
map[key_type]value_type

map[string]string // key与value元素的类型相同
map[int]string    // key与value元素的类型不同
```


Go 语言中要求，**key 的类型必须支持“==”和“!=”两种比较操作符**。对value没有限制

在 Go 语言中，函数类型、map 类型自身，以及切片只支持与 nil 的比较，而不支持同类型两个变量的比较。如果像下面代码这样，进行这些类型的比较，Go 编译器将会报错：

```go
s1 := make([]int, 1)
s2 := make([]int, 2)
f1 := func() {}
f2 := func() {}
m1 := make(map[int]string)
m2 := make(map[int]string)

println(s1 == s2) // 错误：invalid operation: s1 == s2 (slice can only be compared to nil)
println(f1 == f2) // 错误：invalid operation: f1 == f2 (func can only be compared to nil)
println(m1 == m2) // 错误：invalid operation: m1 == m2 (map can only be compared to nil)
```


**函数类型、map 类型自身，以及切片类型是不能作为 map 的 key 类型的**。

#### 声明与初始化。

```go
var
m
map[string]int
//
一个map[string]int类型的变量
```


和切片类型变量一样，如果我们没有显式地赋予 map 变量初值，map 类型变量的默认值为 nil。

不过切片变量和 map 变量在这里也有些不同。初值为零值 nil 的切片类型变量，可以借助内置的 append 的函数进行操作，这种在 Go 语言中被称为“**零值可用**”。定义“零值可用”的类型，可以提升我们开发者的使用体验，我们不用再担心变量的初始状态是否有效。

**但 map 类型，因为它内部实现的复杂性，无法“零值可用”**。所以，如果我们对处于零值状态的 map 变量直接进行操作，就会导致运行时异常（panic），从而导致程序进程异常退出：

```go
var m map[string]int // m = nil
m["key"] = 1         // 发生运行时异常：panic: assignment to entry in nil map
```
初始化方法：
```go
// 方法一：使用复合字面值初始化 map 类型变量。
m := map[int]string{}

m1 := map[int][]string{
    1: []string{"val1_1", "val1_2"},
    3: []string{"val3_1", "val3_2", "val3_3"},
    7: []string{"val7_1"},
}

type Position struct {
    x float64
    y float64
}

m2 := map[Position]string{
    Position{29.935523, 52.568915}:   "school",
    Position{25.352594, 113.304361}:  "shopping-mall",
    Position{73.224455, 111.804306}:  "hospital",
}

//这种情况下，Go 允许省略字面值中的元素类型。
m2 := map[Position]string{
    {29.935523, 52.568915}:  "school",
    {25.352594, 113.304361}: "shopping-mall",
    {73.224455, 111.804306}: "hospital",
}

//方法二：使用 make 为 map 类型变量进行显式初始化。
m1 := make(map[int]string)    // 未指定初始容量
m2 := make(map[int]string, 8) // 指定初始容量为8
//map 类型会自动扩容。
```
**插入键值对：**
```go
m := make(map[int]string)
m[1] = "value1"
m[2] = "value2"
m[3] = "value3"
```
除非内存耗尽，不然不用担心插值结果。
```go
m := map[string]int{
    "key1": 1,
    "key2": 2,
}
m["key1"] = 11 // 11会覆盖掉"key1"对应的旧值1
m["key3"] = 3  // 此时m为map[key1:11 key2:2 key3:3]
```


会覆盖原值，与C++行为一致。

**获取键值对数量** 使用内置函数len，不能使用cap函数，这与数组和切片不同。

```go
m := map[string]int{
    "key1": 1,
    "key2": 2,
}
fmt.Println(len(m)) // 2
m["key3"] = 3
fmt.Println(len(m)) // 3
```
**查找和数据读取**：判断key是否存在map中。
```go
m := make(map[string]int)
v := m["key1"] // 错误，这样无法判断。但是会返回一个value类型的零值，如果不存在的话。

m := make(map[string]int)
v, ok := m["key1"] // 对的对的。
if !ok {
    // "key1"不在map中
}
// "key1"在map中，v将被赋予"key1"键对应的value

//如果不关心value，只关心是否存在：
m := make(map[string]int)
_, ok := m["key1"]
...
...
```


**在 Go 语言中，请使用“comma ok”惯用法对 map 进行键查找和键值读取操作。**

**删除**

使用内置函数delete。

```go
m := map[string]int{
    "key1": 1,
    "key2": 2,
}
fmt.Println(m)       // map[key1:1 key2:2]
delete(m, "key2")    // 删除"key2"
fmt.Println(m)       // map[key1:1]
```


**delete 函数是从 map 中删除键的唯一方法**。即便传给 delete 的键在 map 中并不存在，delete 函数的执行也不会失败，更不会抛出运行时的异常。

**遍历map**

在 Go 中，遍历 map 的键值对只有一种方法，那就是**像对待切片那样通过 for range 语句对 map 数据进行遍历**。

```go
m := map[int]int{
    1: 11,
    2: 12,
    3: 13,
}
fmt.Printf("{ ")
for k, v := range m {
    fmt.Printf("[%d, %d] ", k, v)
}
fmt.Printf("}\n")
```


**对同一 map 做多次遍历的时候，每次遍历元素的次序都不相同**。这是 Go 语言 map 类型的一个重要特点，也是很容易让 Go 初学者掉入坑中的一个地方。所以这里你一定要记住：**程序逻辑千万不要依赖遍历 map 所得到的的元素次序**。

**map 传递开销**

map 只是传递**描述符**，是引用。

```go
package main

import "fmt"

func foo(m map[string]int) {
    m["key1"] = 11
    m["key2"] = 12
}

func main() {
    m := map[string]int{
        "key1": 1,
        "key2": 2,
    }
    fmt.Println(m) // map[key1:1 key2:2]

    foo(m)
    fmt.Println(m) // map[key1:11 key2:12]
}
```


**map 内部实现**

map 内部使用哈希表。

Go 编译器会将 Go 语法层面的 map 操作，重写成运行时对应的函数调用。大致的对应关系是这样的：

```go
// 创建map类型变量实例
m := make(map[keyType]valType, capacityhint) → m := runtime.makemap(maptype, capacityhint, m)

// 插入新键值对或给键重新赋值
m["key"] = "value" → v := runtime.mapassign(maptype, m, "key")
v是用于后续存储value的空间的地址

// 获取某键的值
v := m["key"]     → v := runtime.mapaccess1(maptype, m, "key")
v, ok := m["key"] → v, ok := runtime.mapaccess2(maptype, m, "key")

// 删除某键
delete(m, "key") → runtime.mapdelete(maptype, m, "key")
```


![image-20250514204343647](/img/go%E5%AD%A6%E4%B9%A0/image-20250514204343647.webp)

**初始状态**

hmap 类型是 map 类型的头部结构（header），也就是我们前面在讲解 map 类型变量传递开销时提到的 **map 类型的描述符**，它存储了后续 map 类型操作所需的所有信息，包括：

![image-20250514204443028](/img/go%E5%AD%A6%E4%B9%A0/image-20250514204443028.webp)

真正用来存储键值对数据的是桶，也就是 bucket，每个 bucket 中存储的是 Hash 值低 bit 位数值相同的元素，默认的元素个数为 BUCKETSIZE。

可见是可拓展哈希。

**tophash 区域**

![image-20250514204729499](/img/go%E5%AD%A6%E4%B9%A0/image-20250514204729499.webp)

当我们向 map 插入一条数据，或者是从 map 按 key 查询数据的时候，运行时都会使用哈希函数对 key 做哈希运算，并获得一个哈希值（hashcode）。这个 hashcode 非常关键，运行时会把 hashcode“一分为二”来看待，其中低位区的值用于选定 bucket，高位区的值用于在某个 bucket 中确定 key 的位置。

**key 存储区域**

```go
type maptype struct {
    typ        _type
    key        *_type
    elem       *_type
    bucket     *_type // internal type representing a hash bucket
    keysize    uint8  // size of key slot
    elemsize   uint8  // size of elem slot
    bucketsize uint16 // size of bucket
    flags      uint32
}
```


编译器会把语法层面的 map 操作重写成运行时对应的函数调用，这些运行时函数都有一个共同的特点，那就是第一个参数都是 maptype 指针类型的参数。

**Go 运行时就是利用 maptype 参数中的信息确定 key 的类型和大小的。**（像是C语言的 void* 来实现类似于泛型的东西）

**value 存储区域**

Go 运行时采用了把 key 和 value 分开存储的方式，而不是采用一个 kv 接着一个 kv 的 kv 紧邻方式存储，这带来的其实是算法上的复杂性，但却减少了因内存对齐带来的内存浪费。（kv分离，唔）

![image-20250514205418005](/img/go%E5%AD%A6%E4%B9%A0/image-20250514205418005.webp)

如果 key 或 value 的数据长度大于一定数值，那么运行时不会在 bucket 中直接存储数据，而是会存储 key 或 value 数据的指针。目前 Go 运行时定义的最大 key 和 value 的长度是这样的：

```go
// $GOROOT/src/runtime/map.go
const (
    maxKeySize  = 128
    maxElemSize = 128
)
```


**map 扩容**

那么 map 在什么情况下会进行扩容呢？Go 运行时的 map 实现中引入了一个 LoadFactor（负载因子），当 **count > LoadFactor * 2^B** 或 overflow bucket 过多时，运行时会自动对 map 进行扩容。目前 Go 1.17 版本 LoadFactor 设置为 6.5

```go
// $GOROOT/src/runtime/map.go
const (
    ... ...
    loadFactorNum = 13
    loadFactorDen = 2
    ... ...
)

func mapassign(t *maptype, h *hmap, key unsafe.Pointer) unsafe.Pointer {
    ... ...
    if !h.growing() && (overLoadFactor(h.count+1, h.B) || tooManyOverflowBuckets(h.noverflow, h.B)) {
        hashGrow(t, h)
        goto again // Growing the table invalidates everything, so try again
    }
    ... ...
}
```


如果是因为当前数据数量超出 LoadFactor 指定水位而进行的扩容，那么运行时会建立一个**两倍于现有规模的 bucket 数组**，但真正的排空和迁移工作也是在 assign 和 delete 时逐步进行的。原 bucket 数组会挂在 hmap 的 oldbuckets 指针下面，直到原 buckets 数组中所有数据都迁移到新数组后，原 buckets 数组才会被释放。

![image-20250514210046014](/img/go%E5%AD%A6%E4%B9%A0/image-20250514210046014-1747227647497-1.webp)

逐步迁移，减少性能波动。让oldbuckets，逐渐不存储数据，而是存储指针，直到最后释放。

**map 与并发**

从上面的实现原理来看，充当 map 描述符角色的 hmap 实例自身是有状态的（hmap.flags），而且对状态的读写是没有并发保护的。所以说 map 实例不是并发写安全的，也不支持并发读写。如果我们对 map 实例进行并发读写，程序运行时就会抛出异常。

```go
package main

import (
    "fmt"
    "time"
)

func doIteration(m map[int]int) {
    for k, v := range m {
        _ = fmt.Sprintf("[%d, %d] ", k, v)
    }
}

func doWrite(m map[int]int) {
    for k, v := range m {
        m[k] = v + 1
    }
}

func main() {
    m := map[int]int{
        1: 11,
        2: 12,
        3: 13,
    }
    go func() {
        for i := 0; i < 1000; i++ {
            doIteration(m)
        }
    }()
    go func() {
        for i := 0; i < 1000; i++ {
            doWrite(m)
        }
    }()
    time.Sleep(5 * time.Second)
}

// 运行： fatal error: concurrent map iteration and map write
```


不过，如果我们仅仅是进行并发读，map 是没有问题的。而且，Go 1.9 版本中引入了支持并发写安全的 sync.Map 类型，可以用来在并发读写的场景下替换掉 map。

考虑到 map 可以自动扩容，map 中数据元素的 value 位置可能在这一过程中发生变化，所以 **Go 不允许获取 map 中 value 的地址，这个约束是在编译期间就生效的**。

```go
p := &m[key] // cannot take the address of m[key]
fmt.Println(p)
```


## 复合数据类型：结构体

在 Go 中，我们自定义一个新类型一般有两种方法。**第一种是类型定义（Type Definition），这也是我们最常用的类型定义方法。在这种方法中，我们会使用关键字**type 来定义一个新类型 T

```go
type T S // 定义一个新类型T
type T1 int
type T2 T1
```


**底层类型**。如果一个新类型是基于某个 Go 原生类型定义的，那么我们就叫 Go 原生类型为新类型的**底层类型（Underlying Type)**。

如果不是基于 Go 原生类型定义的新类型，比如 T2，它的底层类型是什么呢？这时我们就要看它定义时是基于什么类型了。这里，T2 是基于 T1 类型创建的，那么 T2 类型的底层类型就是 T1 的底层类型，而 T1 的底层类型我们已经知道了，是类型 int，那么 T2 的底层类型也是类型 int。

底层类型在 Go 语言中有重要作用，**它被用来判断两个类型本质上是否相同（Identical）。**

在上面例子中，虽然 T1 和 T2 是不同类型，但因为它们的底层类型都是类型 int，所以它们在本质上是相同的。**而本质上相同的两个类型，它们的变量可以通过显式转型进行相互赋值，相反，如果本质上是不同的两个类型，它们的变量间连显式转型都不可能，更不要说相互赋值了。**

```go
type T1 int
type T2 T1
type T3 string

func main() {
    var n1 T1
    var n2 T2 = 5
    n1 = T1(n2) // ok

    var s T3 = "hello"
    n1 = T1(s) // 错误：cannot convert s (type T3) to type T1
}
```
我们还可以基于**类型字面值**来定义新类型，这种方式多用于自定义一个新的复合类型，比如：
```go
type M map[int]string
type S []string
```
类型定义也支持通过
type
块的方式进行，比如我们可以把上面代码中的
T1、T2
和
T3
的定义放在同一个
type
块中：
```go
type (
    T1 int
    T2 T1
    T3 string
)
```
**第二种自定义新类型的方式是使用类型别名（Type
Alias）**，本质两种类型是一摸一样的，这种类型定义方式通常用在项目的渐进式重构，还有对已有包的二次封装方面，它的形式是这样的：
```go
type T = S // type alias
type T = string

var s string = "hello"
var t T = s // ok
fmt.Printf("%T\n", t) // string
```
结构体：
```go
type T struct {
    Field1 T1
    Field2 T2
    ... ...
    FieldN Tn
}
```
定义中
struct
关键字后面的大括号包裹的内容就是一个**类型字面值**。
```go
package book

type Book struct {
    Title   string         // 书名
    Pages   int            // 书的页数
    Indexes map[string]int // 书的索引
}
```
Go
用标识符名称的首字母大小写来判定这个标识符是否为导出标识符。所以，这里的类型
Book
以及它的各个字段都是导出标识符。这样，只要其他包导入了包
book，我们就可以在这些包中直接引用类型名
Book，也可以通过
Book
类型变量引用
Name、Pages
等字段。
```go
import ".../book"

var b book.Book
b.Title = "The Go Programming Language"
b.Pages = 800
```
**定义一个空结构体。**
```go
type Empty struct{} // Empty是一个不包含任何字段的空结构体类型

var s Empty
println(unsafe.Sizeof(s)) // 0

var c = make(chan Empty) // 声明一个元素类型为Empty的channel
c <- Empty{}             // 向channel写入一个"事件"
```


可以在管道中，当作一种hint，表示发生与否。

空结构体为元素类建立的 channel，是目前能实现的、内存占用最小的 Goroutine 间通信方式。

**使用其他结构体作为自定义结构体中字段的类型。**

```go
type Person struct {
    Name  string
    Phone string
    Addr  string
}

type Book struct {
    Title  string
    Author Person
    ... ...
}

var book Book

println(book.Author.Phone)
```
对于包含结构体类型字段的结构体类型来说，Go
还提供了一种更为简便的定义方法，**那就是我们可以无需提供字段的名字，只需要使用其类型就可以了**，以上面的
Book
结构体定义为例，我们可以用下面的方式提供一个等价的定义：
```go
type Book struct {
    Title string
    Person
    ... ...
}
```
以这种方式定义的结构体字段，我们叫做**嵌入字段（Embedded
Field）**。我们也可以将这种字段称为匿名字段，或者把类型名看作是这个字段的名字。
```go
var book Book

println(book.Person.Phone) // 将类型名当作嵌入字段的名字
println(book.Phone)        // 支持直接访问嵌入字段所属类型中字段
```
第一种方式显然是通过把类型名当作嵌入字段的名字来进行操作的，而第二种方式更像是一种“语法糖”，我们可以“绕过”Person
类型这一层，直接访问
Person
中的字段。
```go
type T struct {
    t T
    ... ...
}
```
Go
语言不支持这种在结构体类型定义中，递归地放入其自身类型字段的定义方式。
```go
type T1 struct {
    t2 T2
}

type T2 struct {
    t1 T1
}

type T struct {
    t  *T           // ok
    st []T          // ok
    m  map[string]T // ok
}
```
结构体变量的声明与初始化：
```go
type Book struct {
    ...
}

var book Book
var book = Book{}
book := Book{}
```


**结构体类型的变量通常都要被赋予适当的初始值后，才会有合理的意义。**

**零值初始化**

`var book Book // book为零值结构体变量`

那么采用零值初始化的零值结构体变量就真的没有任何价值了吗？恰恰相反。如果一种类型采用零值初始化得到的零值变量，是有意义的，而且是直接可用的，我称这种类型为**“零值可用”类型**。可以说，定义零值可用类型是简化代码、改善开发者使用体验的一种重要的手段。

```go
var mu sync.Mutex
mu.Lock()
mu.Unlock()

var b bytes.Buffer
b.Write([]byte("Hello, Go"))
fmt.Println(b.String()) // 输出：Hello, Go
```


不过有些类型确实不能设计为零值可用类型，就比如我们前面的 Book 类型，它们的零值并非有效值。对于这类类型，我们需要对它的变量进行显式的初始化后，才能正确使用。

**使用复合字面量初始化结构体**

最简单的对结构体变量进行显式初始化的方式，就是**按顺序依次给每个结构体字段进行赋值**，

```go
type Book struct {
    Title   string         // 书名
    Pages   int            // 书的页数
    Indexes map[string]int // 书的索引
}

var book = Book{"The Go Programming Language", 700, make(map[string]int)}
```
但是，如果结构体定义变化，字段多，或者存在不可导出字段，这就很不方便了。
```go
type T struct {
    F1 int
    F2 string
    f3 int
    F4 int
    F5 int
}

var t = T{11, "hello", 13} // 错误：implicit assignment of unexported field 'f3' in T literal
// 或
var t = T{11, "hello", 13, 14, 15} // 错误：implicit assignment of unexported field 'f3' in T literal
```
Go
推荐我们用**“field:value”形式的复合字面值**，对结构体类型变量进行显式初始化，这种方式可以降低结构体类型使用者和结构体类型设计者之间的耦合，这也是
Go
语言的惯用法。
```go
var t = T{
    F2: "hello",
    F1: 11,
    F4: 14,
}
```


未显式出现在字面值中的结构体字段（比如上面例子中的 F5）将采用它对应类型的零值。

记：nil

```go
var
nil
Type
//
Type
must
be
a
pointer,
channel,
func,
interface,
map,
or
slice
type
```


复合字面值作为结构体类型变量初值被广泛使用，即便结构体采用类型零值时，我们也会使用复合字面值的形式：`t := T{}`

而比较少使用 new 这一个 Go 预定义的函数来创建结构体变量实例：`tp := new(T)`

我们不能用从其他包导入的结构体中的未导出字段，来作为复合字面值中的 field。这会导致编译错误，因为未导出字段是不可见的。

那么，如果一个结构体类型中包含未导出字段，并且这个字段的零值还不可用时，我们要如何初始化这个结构体类型的变量呢？又或是一个结构体类型中的某些字段，需要一个复杂的初始化逻辑，我们又该怎么做呢？这时我们就需要使用一个特定的构造函数，来创建并初始化结构体变量了。

**使用特定的构造函数**

使用特定的构造函数创建并初始化结构体变量的例子，并不罕见。

```go
// $GOROOT/src/time/sleep.go
type runtimeTimer struct {
    pp       uintptr
    when     int64
    period   int64
    f        func(interface{}, uintptr)
    arg      interface{}
    seq      uintptr
    nextwhen int64
    status   uint32
}

type Timer struct {
    C <-chan Time
    r runtimeTimer
}

// $GOROOT/src/time/sleep.go
func NewTimer(d Duration) *Timer {
    c := make(chan Time, 1)
    t := &Timer{
        C: c,
        r: runtimeTimer{
            when: when(d),
            f:    sendTime,
            arg:  c,
        },
    }
    startTimer(&t.r)
    return t
}
```
这类通过专用构造函数进行结构体类型变量创建、初始化的例子还有很多，我们可以总结一下，它们的专用构造函数大多都符合这种模式：
```go
func NewT(field1, field2, ...) *T {
    ... ...
}
```


这里，NewT 是结构体类型 T 的专用构造函数，它的参数列表中的参数通常与 T 定义中的导出字段相对应，返回值则是一个 T 指针类型的变量。T 的非导出字段在 NewT 内部进行初始化，一些需要复杂初始化逻辑的字段也会在 NewT 内部完成初始化。这样，我们只要调用 NewT 函数就可以得到一个可用的 T 指针类型变量了.

**结构体类型的内存布局**

![image-20250514221254656](/img/go%E5%AD%A6%E4%B9%A0/image-20250514221254656.webp)

我们可以借助标准库 unsafe 包提供的函数，获得结构体类型变量占用的内存大小，以及它每个字段在内存中相对于结构体变量起始地址的偏移量：

```go
var t T
unsafe.Sizeof(t)      // 结构体类型变量占用的内存大小
unsafe.Offsetof(t.Fn) // 字段Fn在内存中相对于变量t起始地址的偏移量
```


![image-20250514221339662](/img/go%E5%AD%A6%E4%B9%A0/image-20250514221339662.webp)

为什么会出现内存对齐的要求呢？这是出于对处理器存取数据效率的考虑。在早期的一些处理器中，比如 Sun 公司的 Sparc 处理器仅支持内存对齐的地址，如果它遇到没有对齐的内存地址，会引发段错误，导致程序崩溃。我们常见的 x86-64 架构处理器虽然处理未对齐的内存地址不会出现段错误，但数据的存取性能也会受到影响。

比如下面两个结构体类型表示的抽象是相同的，但正是因为字段排列顺序不同，导致它们的大小也不同：

```go
type T struct {
    b byte
    i int64
    u uint16
}

type S struct {
    b byte
    u uint16
    i int64
}

func main() {
    var t T
    println(unsafe.Sizeof(t)) // 24
    var s S
    println(unsafe.Sizeof(s)) // 16
}
```
有些时候，为了保证某个字段的内存地址有更为严格的约束，我们也会做主动填充。比如
runtime
包中的
mstats
结构体定义就采用了主动填充：
```go
// $GOROOT/src/runtime/mstats.go
type mstats struct {
    ... ...
    // Add an uint32 for even number of size classes to align below fields
    // to 64 bits for atomic operations on 32 bit platforms.
    _ [1 - _NumSizeClasses%2]uint32 // 这里做了主动填充
    last_gc_nanotime uint64 // last gc (monotonic time)
    last_heap_inuse  uint64 // heap_inuse at mark termination of the previous GC
    ... ...
}
```


## 控制结构

* Go 坚持“一件事情仅有一种做法的理念”，只保留了 for 这一种循环结构，去掉了 C 语言中的 while 和 do-while 循环结构；
* Go 填平了 C 语言中 switch 分支结构中每个 case 语句都要以 break 收尾的“坑”；
* Go 支持了 type switch 特性，让“类型”信息也可以作为分支选择的条件；
* Go 的 switch 控制结构的 case 语句还支持表达式列表，让相同处理逻辑的多个分支可以合并为一个分支，等等。

### if 分支

```
if
boolean_expression
{     // 新分支 }
//
原分支
```


第一，和 Go 函数一样，if 语句的分支代码块的左大括号与 if 关键字在同一行上，这也是 Go 代码风格的统一要求，gofmt 工具会帮助我们实现这一点；

第二，if 语句的布尔表达式整体不需要用括号包裹，一定程度上减少了开发人员敲击键盘的次数。而且，if 关键字后面的条件判断表达式的求值结果必须是布尔类型，即要么是 true，要么是 false：

```go
if runtime.GOOS == "linux" {
    println("we are on linux os")
}

if (runtime.GOOS == "linux") &&
    (runtime.GOARCH == "amd64") &&
    (runtime.Compiler != "gccgo") {
    println("we are using standard go compiler on linux os for amd64")
}
```


![image-20250515144621388](/img/go%E5%AD%A6%E4%B9%A0/image-20250515144621388.webp)

![image-20250515144643734](/img/go%E5%AD%A6%E4%B9%A0/image-20250515144643734.webp)

**左右移优先级大于+，-，这点和C++不同**

多分支：

```go
if boolean_expression1 {
    // 分支1
} else if boolean_expression2 {
    // 分支2
    ... ...
} else if boolean_expressionN {
    // 分支N
} else {
    // 分支N+1
}

// 等价于：
if boolean_expression1 {
    // 分支1
} else {
    if boolean_expression2 {
        // 分支2
    } else {
        if boolean_expression3 {
            // 分支3
        } else {
            // 分支4
        }
    }
}
```
**if
语句的自用变量**
```go
func main() {
    if a, c := f(), h(); a > 0 {
        println(a)
    } else if b := f(); b > 0 {
        println(a, b)
    } else {
        println(a, b, c)
    }
}
```


其中，a，b，c，在判断之前声明定义得变量，是自用变量。

至于这些变量的生命周期，则是从声明，到整个 if 结束。

**在 if 语句中声明自用变量是 Go 语言的一个惯用法**

不过Go 控制结构与短变量声明的结合也是“变量遮蔽”问题出没的重灾区。

**if 语句的“快乐路径”原则**

```go
// 伪代码段1：
func doSomething() error {
    if errorCondition1 {
        // some error logic
        ... ...
        return err1
    }

    // some success logic
    ... ...

    if errorCondition2 {
        // some error logic
        ... ...
        return err2
    }

    // some success logic
    ... ...
    return nil
}

// 伪代码段2：
func doSomething() error {
    if successCondition1 {
        // some success logic
        ... ...
        if successCondition2 {
            // some success logic
            ... ...
            return nil
        } else {
            // some error logic
            ... ...
            return err2
        }
    } else {
        // some error logic
        ... ...
        return err1
    }
}
```


显然代码段一优于代码段二。

也就是成功路径顺下来，if 语句处理失败情况并返回。

这种思路跟`if 语句如果返回则不允许写 else`有类似之处。原来叫快乐路径啊。

所谓“快乐路径”也就是成功逻辑的代码执行路径，它的特点是这样的：

* 仅使用单分支控制结构；
* 当布尔表达式求值为 false 时，也就是出现错误时，在单分支中快速返回；
* 正常逻辑在代码布局上始终“靠左”，这样读者可以从上到下一眼看到该函数正常逻辑的全貌；
* 函数执行到最后一行代表一种成功状态。
* 尝试将“正常逻辑”提取出来，放到“快乐路径”中；
* 如果无法做到上一点，很可能是函数内的逻辑过于复杂，可以将深度缩进到 else 分支中的代码析出到一个函数中，再对原函数实施“快乐路径”原则。

### for 循环

Go 只有一种循环语句，也就是 for 语句。

```
// C. int i;
int sum = 0;
for (i = 0;
i < 10;
i++) {     sum += i;
} printf("%d\n", sum);
```




```go
// Go. for 循环的经典形式
var sum int
for i := 0; i < 10; i++ {
    sum += i
}
println(sum)

// 多变量声明
for i, j, k := 0, 1, 2; (i < 20) && (j < 10) && (k < 30); i, j, k = i+1, j+1, k+5 {
    sum += (i + j + k)
    println(sum)
}

// 与C一样，();();() 这三个东西都可以省略。
i := 0
for ; i < 10; {
    println(i)
    i++
}

// 但是只保留 ;(); 时，可以更优化为：
i := 0
for i < 10 {
    println(i)
    i++
}

// 也就是 while 循环

// 如果要求死循环：
for {
    // 循环体代码
}

// 等价于：
for true {
}

// 或
for ;; {
}
```
**for
range
循环**
```go
var sl = []int{1, 2, 3, 4, 5}
for i := 0; i < len(sl); i++ {
    fmt.Printf("sl[%d] = %d\n", i, sl[i])
}

// 等价于:
for i, v := range sl {
    fmt.Printf("sl[%d] = %d\n", i, v)
}

// 变种一：当我们不关心元素的值时，我们可以省略代表元素值的变量 v，
// 只声明代表下标值的变量 i：
for i := range sl {
    // ...
}

// 变种二：如果我们不关心元素下标，只关心元素值，
// 那么我们可以用空标识符替代代表下标值的变量 i。
// 这里一定要注意，这个空标识符不能省略，
// 否则就与上面的“变种一”形式一样了，Go 编译器将无法区分：
for _, v := range sl {
    // ...
}

// 变种三：到这里，你肯定要问：
// 如果我们既不关心下标值，也不关心元素值，那是否能写成下面这样呢：
for _, _ = range sl {
    // ...
}

// 不太优雅：
for range sl {
    // ...
}
```
**string
类型**
```go
var s = "中国人"
for i, v := range s {
    fmt.Printf("%d %s 0x%x\n", i, string(v), v)
}
```
输出：
```
0 中 0x4e2d 3 国 0x56fd 6 人 0x4eba
```


我们看到：for range 对于 string 类型来说，**每次循环得到的 v 值是一个 Unicode 字符码点**，也就是 rune 类型值，而不是一个字节，返回的第一个值 i 为**该 Unicode 字符码点的内存编码（UTF-8）的第一个字节在字符串内存序列中的位置**。

**map 的for-range**

Go 语言中，**我们要对 map 进行循环操作，for range 是唯一的方法**，for 经典循环形式是不支持对 map 类型变量的循环控制的。

```go
var m = map[string]int{
    "Rob":  67,
    "Russ": 39,
    "John": 29,
}
for k, v := range m {
    println(k, v)
}
```


**每次循环，循环变量 k 和 v 分别会被赋值为 map 键值对集合中一个元素的 key 值和 value 值**。

**channel 的for-range**

```go
var c = make(chan int)
for v := range c {
    // ...
}
```


在这个例子中，for range 每次从 channel 中读取一个元素后，会把它赋值给循环变量 v，并进入循环体。当 channel 中没有数据可读的时候，for range 循环会阻塞在对 channel 的读操作上。直到 channel 关闭时，for range 循环才会结束，这也是 for range 循环与 channel 配合时隐含的循环判断条件。

**带 label 的 continue 语句**

```go
var sum int
var sl = []int{1, 2, 3, 4, 5, 6}
for i := 0; i < len(sl); i++ {
    if sl[i]%2 == 0 {
        // 忽略切片中值为偶数的元素
        continue
    }
    sum += sl[i]
}
println(sum) // 9
```
这段代码与C无异。但
Go
语言中的
continue
在
C
语言
continue
语义的基础上**又增加了对
label
的支持**。
```go
func main() {
    var sum int
    var sl = []int{1, 2, 3, 4, 5, 6}
loop:
    for i := 0; i < len(sl); i++ {
        if sl[i]%2 == 0 {
            // 忽略切片中值为偶数的元素
            continue loop
        }
        sum += sl[i]
    }
    println(sum) // 9
}
```
通常出现于**嵌套循环语句**中，**被用于跳转到外层循环并继续执行外层循环语句的下一个迭代**
```go
func main() {
    var sl = [][]int{
        {1, 34, 26, 35, 78},
        {3, 45, 13, 24, 99},
        {101, 13, 38, 7, 127},
        {54, 27, 40, 83, 81},
    }
outerloop:
    for i := 0; i < len(sl); i++ {
        for j := 0; j < len(sl[i]); j++ {
            if sl[i][j] == 13 {
                fmt.Printf("found 13 at [%d, %d]\n", i, j)
                continue outerloop
            }
        }
    }
}
```


一些学习过 goto 语句的同学可能就会问了，如果我把上述代码中的 continue 换成 goto 语句，是否也可以实现同样的效果？

答案是否定的！一旦使用 goto 跳转，那么**不管是内层循环还是外层循环都会被终结，代码将会从 outerloop 这个 label 处，开始重新执行我们的嵌套循环语句，这与带 label 的 continue 的跳转语义是完全不同的**。

**break 语句的使用**

Go 也 break 语句增加了对 label 的支持。

```go
var gold = 38

func main() {
    var sl = [][]int{
        {1, 34, 26, 35, 78},
        {3, 45, 13, 24, 99},
        {101, 13, 38, 7, 127},
        {54, 27, 40, 83, 81},
    }
outerloop:
    for i := 0; i < len(sl); i++ {
        for j := 0; j < len(sl[i]); j++ {
            if sl[i][j] == gold {
                fmt.Printf("found gold at [%d, %d]\n", i, j)
                break outerloop
            }
        }
    }
}
```


注意：标签只表示区域，而且必须先声明后跳转。

**for 语句的常见“坑”与避坑方法**

**问题一：循环变量的重用**

```go
func main() {
    var m = []int{1, 2, 3, 4, 5}
    for i, v := range m {
        go func() {
            time.Sleep(time.Second * 3)
            fmt.Println(i, v)
        }()
    }
    time.Sleep(time.Second * 10)
}
```
可见，在func中，i，v是引用。
```
// 期望：
// 0 1
// 1 2
// 2 3
// 3 4
// 4 5
// 结果：
// 4 5
// 4 5
// 4 5
// 4 5
// 4 5
```




```go
func main() {
    var m = []int{1, 2, 3, 4, 5}
    for i, v := range m {
        go func(i, v int) {
            time.Sleep(time.Second * 3)
            fmt.Println(i, v)
        }(i, v)
    }
    time.Sleep(time.Second * 10)
}
```


通过值传递就可以解决这个问题。

**问题二：参与循环的是 range 表达式的副本**

```go
func main() {
    var a = [5]int{1, 2, 3, 4, 5}
    var r [5]int
    fmt.Println("original a =", a)
    for i, v := range a {
        if i == 0 {
            a[1] = 12
            a[2] = 13
        }
        r[i] = v
    }
    fmt.Println("after for range loop, r =", r)
    fmt.Println("after for range loop, a =", a)
}
```




```
// 期望：
// original a = [1 2 3 4 5]
// after for range loop, r = [1 12 13 4 5]
// after for range loop, a = [1 12 13 4 5]
// 结果：
// original a = [1 2 3 4 5]
// after for range loop, r = [1 2 3 4 5]
// after for range loop, a = [1 12 13 4 5]
```


原因就是**参与 for range 循环的是 range 表达式的副本。**

用切片可以解决这个问题：

```go
func main() {
    var a = [5]int{1, 2, 3, 4, 5}
    var r [5]int
    fmt.Println("original a =", a)
    for i, v := range a[:] { // 切片或者使用指针 &a
        if i == 0 {
            a[1] = 12
            a[2] = 13
        }
        r[i] = v
    }
    fmt.Println("after for range loop, r =", r)
    fmt.Println("after for range loop, a =", a)
}
```


**问题三：遍历 map 中元素的随机性**

### switch

```go
switch initStmt; expr {
case expr1:
    // 执行分支1
case expr2:
    // 执行分支2
case expr3_1, expr3_2, expr3_3:
    // 执行分支3
case expr4:
    // 执行分支4
... ...
case exprN:
    // 执行分支N
default:
    // 执行默认分支
}

func readByExtBySwitch(ext string) {
    switch ext {
    case "json":
        println("read json file")
    case "jpg", "jpeg", "png", "gif":
        println("read image file")
    case "txt", "md":
        println("read text file")
    case "yml", "yaml":
        println("read yaml file")
    case "ini":
        println("read ini file")
    default:
        println("unsupported file extension:", ext)
    }
}
```
关于
switch
求值顺序：
```go
func case1() int {
    println("eval case1 expr")
    return 1
}

func case2_1() int {
    println("eval case2_1 expr")
    return 0
}

func case2_2() int {
    println("eval case2_2 expr")
    return 2
}

func case3() int {
    println("eval case3 expr")
    return 3
}

func switchexpr() int {
    println("eval switch expr")
    return 2
}

func main() {
    switch switchexpr() {
    case case1():
        println("exec case1")
    case case2_1(), case2_2():
        println("exec case2")
    case case3():
        println("exec case3")
    default:
        println("exec default")
    }
}
```
输出：
```
eval switch expr eval case1 expr eval case2_1 expr eval case2_2 expr exec case2
```


也就是说，Go的 switch 只是好看的 if 而已，不能像C一样来用优化性能。

**无论 default 分支出现在什么位置，它都只会在所有 case 都没有匹配上的情况下才会被执行的。**

Go 语言中只要类型支持比较操作，都可以作为 switch 语句中的表达式类型。

而且，当 switch 表达式的类型为布尔类型时，如果求值结果始终为 true，那么我们甚至可以省略 switch 后面的表达式，比如下面例子：

```
// 带有initStmt语句的switch语句 switch initStmt;
{     case bool_expr1:     case bool_expr2:     ... ... } // 没有initStmt语句的switch语句 switch {     case bool_expr1:     case bool_expr2:     ... ... }
```


**第二点：switch 语句支持声明临时变量。**

switch 语句的 initStmt 可用来声明只在这个 switch 隐式代码块中使用的变量，这种就近声明的变量最大程度地缩小了变量的作用域。

**第三点：case 语句支持表达式列表。**

```go
func
checkWorkday
(a int)
{     switch a
{     case 1, 2, 3, 4, 5:         println
("it is a work day")     case 6, 7:         println
("it is a weekend day")     default:         println
("are you live on earth")     } }
```
如果在少数场景下，你需要执行下一个
case
的代码逻辑，你可以显式使用
Go
提供的关键字
fallthrough
来实现，这也是
Go“显式”设计哲学的一个体现。
```go
func
case1
()
int
{     println
("eval case1 expr")     return 1 }
func
case2
()
int
{     println
("eval case2 expr")     return 2 }
func
switchexpr
()
int
{     println
("eval switch expr")     return 1 }
func
main
()
{     switch switchexpr
()
{     case case1
():         println
("exec case1")         fallthrough     case case2
():         println
("exec case2")         fallthrough     default:         println
("exec default")     } }
```
**type
switch**
```go
func
main
()
{     var x interface
{} = 13     switch v := x.
(type)
{     case nil:         println
("x is nil")     case int:         println
("the type of x is int")     case string:         println
("the type of x is string")     case bool:         println
("the type of x is string")     default:         println
("don't support the type")     } }
```


switch 关键字后面跟着的表达式为x.(type)，这种表达式形式是 switch 语句专有的，而且也只能在 switch 语句中使用。这个表达式中的 **x 必须是一个接口类型变量**，表达式的求值结果是这个接口类型变量对应的动态类型。

**v 存储的是变量 x 的动态类型对应的值信息**

```go
type
I
interface
{       M
()   }
type
T
struct
{   }
func
(T)
M
()
{  }
func
main
()
{      var t T      var i I = t      switch i.
(type)
{      case T:          println
("it is type T")      case int:          println
("it is type int")      case string:          println
("it is type string")      }  }
```
在这个例子中，我们在
type
switch
中使用了自定义的接口类型
I。那么，理论上所有
case
后面的类型都只能是实现了接口
I
的类型。但在这段代码中，只有类型
T
实现了接口类型
I，Go
原生类型
int
与
string
都没有实现接口
I，于是在编译上述代码时，编译器会报出如下错误信息：
```
19:2:
impossible
type
switch
case:
i
(type I)
cannot
have
dynamic
type
int
(missing M method)
21:2:
impossible
type
switch
case:
i
(type I)
cannot
have
dynamic
type
string
(missing M method)
```
**跳不出循环的
break**
```go
func main() {     var sl = []int{5, 19, 6, 3, 8, 12}     var firstEven int = -1     // find first even number of the interger slice     for i := 0;
i < len(sl);
i++ {         switch sl[i] % 2 {         case 0:             firstEven = sl[i]             break         case 1:             // do nothing         }             }              println(firstEven)  }
```


Go 语言规范中明确规定，**不带 label 的 break 语句中断执行并跳出的，是同一函数内 break 语句所在的最内层的 for、switch 或 select**。

## 函数 - 一等公民

在 Go 中，我们定义一个函数的最常用方式就是使用**函数声明**。我们以 Go 标准库 fmt 包提供的 Fprintf 函数为例，看一下一个**普通 Go 函数的声明**长啥样：

![image-20250515160849170](/img/go%E5%AD%A6%E4%B9%A0/image-20250515160849170.webp)

**第一部分是关键字 func**，Go 函数声明必须以关键字 func 开始。

**第二部分是函数名**。函数名是指代函数定义的标识符，函数声明后，我们会通过函数名这个标识符来使用这个函数。在同一个 Go 包中，函数名应该是唯一的，并且它也遵守 Go 标识符的导出规则，也就是我们之前说的，首字母大写的函数名指代的函数是可以在包外使用的，小写的就只在包内可见。

**第三部分是参数列表。**参数列表中声明了我们将要在函数体中使用的各个参数。参数列表紧接在函数名的后面，并用一个括号包裹。它使用逗号作为参数间的分隔符，而且每个参数的参数名在前，参数类型在后，这和变量声明中变量名与类型的排列方式是一致的。

另外，Go 函数支持变长参数，也就是一个形式参数可以对应数量不定的实际参数。Fprintf 就是一个支持变长参数的函数，你可以看到它第三个形式参数 a 就是一个变长参数，而且变长参数与普通参数在声明时的不同点，就在于它会在类型前面增加了一个“…”符号。

**第四部分是返回值列表**。返回值承载了函数执行后要返回给调用者的结果，返回值列表声明了这些返回值的类型，返回值列表的位置紧接在参数列表后面，两者之间用一个空格隔开。不过，上图中比较特殊，Fprintf 函数的返回值列表不仅声明了返回值的类型，还声明了返回值的名称，这种返回值被称为**具名返回值**。

**最后，放在一对大括号内的是函数体**，函数的具体实现都放在这里。不过，函数声明中的**函数体是可选的**。如果没有函数体，说明这个函数可能是在 Go 语言之外实现的，比如使用汇编语言实现，然后通过链接器将实现与声明中的函数名链接到一起。

把上面的函数声明等价转换为变量声明的形式看看：

![image-20250515161300622](/img/go%E5%AD%A6%E4%B9%A0/image-20250515161300622-1747296780915-1.webp)

**这不就是在声明一个类型为函数类型的变量吗**！

函数声明中的 func 关键字、参数列表和返回值列表共同构成了**函数类型**。而参数列表与返回值列表的组合也被称为**函数签名**，它是决定两个函数类型是否相同的决定因素。**函数类型**也可以看成是由 func 关键字与函数签名组合而成的。

如：`func(io.Writer, string, ...interface{}) (int, error)`

如果两个函数类型的函数签名是相同的，即便参数列表中的参数名，以及返回值列表中的返回值变量名都是不同的，那么这两个函数类型也是相同类型，比如下面两个函数类型：

```
func
(a int, b string)
(results []string, err error)
func
(c int, d string)
(sl []string, err error)
```
**每个函数声明所定义的函数，仅仅是对应的函数类型的一个实例**
```
s
:=
T
{}
//
使用复合类型字面值对结构体类型T的变量进行显式初始化
f
:=
func
()
{}
//
使用变量声明形式的函数声明
```


这里，T{}被称为复合类型字面值，那么处于同样位置的 func(){}是什么呢？Go 语言也为它准备了一个名字，叫“**函数字面值**（Function Literal）”。我们可以看到，函数字面值由函数类型与函数体组成，它特别像一个没有函数名的函数声明，因此我们也叫它**匿名函数**。

**函数参数**

![image-20250515161931701](/img/go%E5%AD%A6%E4%B9%A0/image-20250515161931701.webp)

函数参数列表中的参数，是函数声明的、用于函数体实现的局部变量。由于函数分为声明与使用两个阶段，在不同阶段，参数的称谓也有不同。在函数声明阶段，我们把参数列表中的参数叫做**形式参数**（Parameter，简称形参），在函数体中，我们使用的都是形参；而在函数实际调用时传入的参数被称为**实际参数**（Argument，简称实参）。

Go 语言中，函数参数传递采用是**值传递**的方式。所谓“值传递”，就是将实际参数在内存中的表示**逐位拷贝**（Bitwise Copy）到形式参数中。对于像整型、数组、结构体这类类型，它们的内存表示就是它们自身的数据内容，因此当这些类型作为实参类型时，值传递拷贝的就是它们自身，传递的开销也与它们自身的大小成正比。

但是像 string、切片、map 这些类型就不是了，它们的内存表示对应的是它们数据内容的“描述符”。当这些类型作为实参类型时，值传递拷贝的也是它们数据内容的“描述符”，不包括数据内容本身，所以这些类型传递的开销是固定的，与数据内容大小无关。这种只拷贝“描述符”，不拷贝实际数据内容的拷贝过程，也被称为**“浅拷贝”**。

不过函数参数的传递也有两个例外，当函数的形参为接口类型，或者形参是变长参数时，简单的值传递就不能满足要求了，这时 Go 编译器会介入：**对于类型为接口类型的形参，Go 编译器会把传递的实参赋值给对应的接口类型形参；对于为变长参数的形参，Go 编译器会将零个或多个实参按一定形式转换为对应的变长形参。**

```go
func
myAppend
(sl []int, elems ...int)
[]int
{     fmt.Printf
("%T\n", elems) // []int     if len
(elems) == 0
{         println
("no elems to append")         return sl     }     sl = append
(sl, elems...)     return sl }
func
main
()
{     sl := []int
{1, 2, 3}     sl = myAppend
(sl) // no elems to append     fmt.Println
(sl) // [1 2 3]     sl = myAppend
(sl, 4, 5, 6)     fmt.Println
(sl) // [1 2 3 4 5 6] }
```


在 Go 中，**变长参数实际上是通过切片来实现的**。

**函数支持多返回值**

```go
func
foo
()
//
无返回值
func
foo
()
error
//
仅有一个返回值
func
foo
()
(int, string, error)
//
有2或2个以上返回值
```


为每个返回值声明变量名，这种带有名字的返回值被称为**具名返回值**（Named Return Value）。

**Go 标准库以及大多数项目代码中的函数，都选择了使用普通的非具名返回值形式。**但在一些特定场景下，具名返回值也会得到应用。

**函数是“一等公民”**

```
如果一门编程语言对某种语言元素的创建和使用没有限制，我们可以像对待值（value）一样对待这种语法元素，那么我们就称这种语法元素是这门编程语言的“一等公民”。拥有“一等公民”待遇的语法元素可以存储在变量中，可以作为参数传递给函数，可以在函数内部创建并可以作为返回值从函数返回。
```


（那么在C语言中，函数也是一等公民了？也能返回，存储，操作）

**特征一：Go 函数可以存储在变量中。**

```go
var
(     myFprintf = func
(w io.Writer, format string, a ...interface
{})
(int, error)
{         return fmt.Fprintf
(w, format, a...)     } )
func
main
()
{     fmt.Printf
("%T\n", myFprintf) // func
(io.Writer, string, ...interface
{})
(int, error)     myFprintf
(os.Stdout, "%s\n", "Hello, Go") // 输出Hello，Go }
```


我们把新创建的一个匿名函数赋值给了一个名为 myFprintf 的变量，通过这个变量，我们便可以调用刚刚定义的匿名函数。

**特征二：支持在函数内创建并通过返回值返回。**

```go
func
setup
(task string)
func
()
{     println
("do some setup stuff for", task)     return func
()
{         println
("do some teardown stuff for", task)     } }
func
main
()
{     teardown := setup
("demo")     defer teardown
() // 延迟，会在整个函数执行结束之后执行。同时倒序执行。     println
("do some bussiness stuff") }
```


这个匿名函数使用了定义它的函数 setup 的局部变量 task，这样的匿名函数在 Go 中也被称为**闭包**（Closure）。

闭包本质上就是一个匿名函数或叫函数字面值，它们可以引用它的包裹函数，也就是创建它们的函数中定义的变量。然后，这些变量在包裹函数和匿名函数之间共享，只要闭包可以被访问，这些共享的变量就会继续存在。

**特征三：作为参数传入函数。**

```
time.AfterFunc
(time.Second*2, func
()
{ println
("timer fired") })
```


**特征四：拥有自己的类型。**

我们甚至可以基于函数类型来自定义类型，就像基于整型、字符串类型等类型来自定义类型一样。下面代码中的 HandlerFunc、visitFunc 就是 Go 标准库中，基于函数类型进行自定义的类型：

```
//
$GOROOT/src/net/http/server.go
type
HandlerFunc
func
(ResponseWriter, *Request)
//
$GOROOT/src/sort/genzfunc.go
type
visitFunc
func
(ast.Node)
ast.Visitor
```


## 多返回值与错误处理

使用多返回值，返回一个单独表示错误状态的值，而不是让错误信息和返回信息耦合在一起。

**error 类型与错误值构造**

error 接口是 Go 原生内置的类型，它的定义如下：

```
//
$GOROOT/src/builtin/builtin.go
type
interface
error
{     Error
() string }
```


任何实现了 error 的 Error 方法的类型的实例，都可以作为错误值赋值给 error 接口变量。那这里，问题就来了：**难道为了构造一个错误值，我们还需要自定义一个新类型来实现 error 接口吗**？

提供了两种方便 Go 开发者构造错误值的方法： errors.New和fmt.Errorf。

```
err
:=
errors.New
("your first demo error")
errWithCtx
=
fmt.Errorf
("index %d is out of bounds", i)
//
返回类型是
errors.errorString
//
$GOROOT/src/errors/errors.go
type
errorString
struct
{     s string }
func
(e *errorString)
Error
()
string
{     return e.s }
```


它们给错误处理者提供的错误上下文（Error Context）只限于以字符串形式呈现的信息，也就是 Error 方法返回的信息。

**自定义错误类型**

```
//
$GOROOT/src/net/net.go
type
OpError
struct
{     Op string     Net string     Source Addr     Addr Addr     Err error }
```


可以提供更多上下文信息。

用error类型的好处：

1. 统一了错误类型。
2. 错误是值。
3. 易扩展，支持自定义错误上下文。

### 错误处理策略

**策略一：透明错误处理策略**

最简单的错误策略莫过于完全不关心返回错误值携带的具体上下文信息，只要发生错误就进入唯一的错误处理执行路径，比如下面这段代码：

```
err
:=
doSomething
()
if
err
!=
nil
{     // 不关心err变量底层错误值所携带的具体上下文信息     // 执行简单错误处理逻辑并返回     ... ...     return err }
```
这也是
Go
语言中**最常见的错误处理策略**，80%
以上的
Go
错误处理情形都可以归类到这种策略下。在这种策略下，由于错误处理方并不关心错误值的上下文，所以错误值的构造方（如上面的函数doSomething）可以直接使用
Go
标准库提供的两个基本错误值构造方法errors.New和fmt.Errorf来构造错误值，就像下面这样：
```go
func
doSomething
(...)
error
{     ... ...     return errors.New
("some error occurred") }
```


这样构造出的错误值代表的上下文信息，对错误处理方是透明的，因此这种策略称为**“透明错误处理策略”**。在错误处理方不关心错误值上下文的前提下，透明错误处理策略能最大程度地减少错误处理方与错误值构造方之间的耦合关系。

**策略二：“哨兵”错误处理策略**

当错误处理方不能只根据“透明的错误值”就做出错误处理路径选取的情况下，错误处理方会尝试对返回的错误值进行检视，于是就有可能出现下面代码中的**反模式**：

```
data,
err
:=
b.Peek
(1)
if
err
!=
nil
{     switch err.Error
()
{     case "bufio: negative count":         // ... ...         return     case "bufio: buffer full":         // ... ...         return     case "bufio: invalid use of UnreadByte":         // ... ...         return     default:         // ... ...         return     } }
```


但这种“反模式”会造成严重的**隐式耦合**。这也就意味着，错误值构造方不经意间的一次错误描述字符串的改动，都会造成错误处理方处理行为的变化，并且这种通过字符串比较的方式，对错误值进行检视的性能也很差。

Go 标准库采用了定义导出的（Exported）“哨兵”错误值的方式，来辅助错误处理方检视（inspect）错误值并做出错误处理分支的决策，比如下面的 bufio 包中定义的“哨兵错误”：

```
//
$GOROOT/src/bufio/bufio.go
var
(     ErrInvalidUnreadByte = errors.New
("bufio: invalid use of UnreadByte")     ErrInvalidUnreadRune = errors.New
("bufio: invalid use of UnreadRune")     ErrBufferFull        = errors.New
("bufio: buffer full")     ErrNegativeCount     = errors.New
("bufio: negative count") )
data,
err
:=
b.Peek
(1)
if
err
!=
nil
{     switch err
{     case bufio.ErrNegativeCount:         // ... ...         return     case bufio.ErrBufferFull:         // ... ...         return     case bufio.ErrInvalidUnreadByte:         // ... ...         return     default:         // ... ...         return     } }
```


（说白了就是约定一些常量来标志错误）

不过，对于 API 的开发者而言，**暴露“哨兵”错误值也意味着这些错误值和包的公共函数 / 方法一起成为了 API 的一部分。**一旦发布出去，开发者就要对它进行很好的维护。而“哨兵”错误值也让使用这些值的错误处理方对它产生了依赖。

从 Go 1.13 版本开始，标准库 errors 包提供了 Is 函数用于错误处理方对错误值的检视。Is 函数类似于把一个 error 类型变量与“哨兵”错误值进行比较，比如下面代码：

```
//
类似
if
err
==
ErrOutOfBounds
{ … }
if
errors.Is
(err, ErrOutOfBounds)
{     // 越界的错误处理 }
```
不同的是，如果
error
类型变量的底层错误值是一个包装错误（Wrapped
Error），errors.Is
方法会沿着该包装错误所在错误链（Error
Chain)，与链上所有被包装的错误（Wrapped Error）进行比较，直至找到一个匹配的错误为止。下面是 Is 函数应用的一个例子：
```go
var
ErrSentinel
=
errors.New
("the underlying sentinel error")
func
main
()
{   err1 := fmt.Errorf
("wrap sentinel: %w", ErrSentinel)   err2 := fmt.Errorf
("wrap err1: %w", err1)     println
(err2 == ErrSentinel) //false   if errors.Is
(err2, ErrSentinel)
{     println
("err2 is ErrSentinel")     return   }   println
("err2 is not ErrSentinel") }
```
输出：
```
false err2 is ErrSentinel
```


我们看到，通过比较操作符对 err2 与 ErrSentinel 进行比较后，我们发现这二者并不相同。而 errors.Is 函数则会沿着 err2 所在错误链，向下找到被包装到最底层的“哨兵”错误值ErrSentinel。

**策略三：错误值类型检视策略**

上面我们看到，基于 Go 标准库提供的错误值构造方法构造的“哨兵”错误值，除了让错误处理方可以“有的放矢”的进行值比较之外，并没有提供其他有效的错误上下文信息。

由于错误值都通过 error 接口变量统一呈现，要得到底层错误类型携带的错误上下文信息，错误处理方需要使用 Go 提供的**类型断言机制**（Type Assertion）或**类型选择机制**（Type Switch），这种错误处理方式，我称之为**错误值类型检视策略**。

如：

```
//
$GOROOT/src/encoding/json/decode.go
type
UnmarshalTypeError
struct
{     Value  string            Type   reflect.Type      Offset int64             Struct string            Field  string       }
```
错误处理方可以通过错误类型检视策略，获得更多错误值的错误上下文信息，下面就是利用这一策略的
json
包的一个方法的实现：
```
//
$GOROOT/src/encoding/json/decode.go
func
(d *decodeState)
addErrorContext
(err error)
error
{     if d.errorContext.Struct != nil || len
(d.errorContext.FieldStack) > 0
{         switch err := err.
(type)
{         case *UnmarshalTypeError:             err.Struct = d.errorContext.Struct.Name
()             err.Field = strings.Join
(d.errorContext.FieldStack, ".")             return err         }     }     return err }
```


这里，一般自定义导出的错误类型以XXXError的形式命名。和“哨兵”错误处理策略一样，错误值类型检视策略，由于暴露了自定义的错误类型给错误处理方，因此这些错误类型也和包的公共函数 / 方法一起，成为了 API 的一部分。一旦发布出去，开发者就要对它们进行很好的维护。而它们也让使用这些类型进行检视的错误处理方对其产生了依赖。

从 Go 1.13 版本开始，标准库 errors 包提供了As函数给错误处理方检视错误值。As函数类似于通过类型断言判断一个 error 类型变量是否为特定的自定义错误类型，如下面代码所示：

```
// 类似 if e, ok := err.(*MyError);
ok { … } var e *MyError if errors.As(err, &e) {     // 如果err类型为*MyError，变量e将被设置为对应的错误值 }
```
不同的是，如果
error
类型变量的动态错误值是一个包装错误，errors.As函数会沿着该包装错误所在错误链，与链上所有被包装的错误的类型进行比较，直至找到一个匹配的错误类型，就像
errors.Is
函数那样。下面是As函数应用的一个例子：
```go
type
MyError
struct
{     e string }
func
(e *MyError)
Error
()
string
{     return e.e }
func
main
()
{     var err = &MyError
{"MyError error demo"}     err1 := fmt.Errorf
("wrap err: %w", err)     err2 := fmt.Errorf
("wrap err1: %w", err1)     var e *MyError     if errors.As
(err2, &e)
{         println
("MyError is on the chain of err2")         println
(e == err)                           return                                  }                                           println
("MyError is not on the chain of err2") }
```
输出：
```
MyError is on the chain of err2 true
```


**策略四：错误行为特征检视策略**

第一种策略，也就是“透明错误处理策略”，有效降低了错误的构造方与错误处理方两者之间的耦合。虽然前面的策略二和策略三，都是我们实际编码中有效的错误处理策略，但其实使用这两种策略的代码，依然在错误的构造方与错误处理方两者之间建立了耦合。

在 Go 标准库中，我们发现了这样一种错误处理方式：**将某个包中的错误类型归类，统一提取出一些公共的错误行为特征，并将这些错误行为特征放入一个公开的接口类型中**。这种方式也被叫做错误行为特征检视策略。

如：

```
//
$GOROOT/src/net/net.go
type
Error
interface
{     error     Timeout
() bool       Temporary
() bool }
```


我们看到，net.Error 接口包含两个用于判断错误行为特征的方法：Timeout 用来判断是否是超时（Timeout）错误，Temporary 用于判断是否是临时（Temporary）错误。

而错误处理方只需要依赖这个公共接口，就可以检视具体错误值的错误行为特征信息，并根据这些信息做出后续错误处理分支选择的决策。

这里，我们再看一个 http 包使用错误行为特征检视策略进行错误处理的例子，加深下理解：

```
// $GOROOT/src/net/http/server.go func (srv *Server) Serve(l net.Listener) error {     ... ...     for {         rw, e := l.Accept()         if e != nil {             select {             case <-srv.getDoneChan():                 return ErrServerClosed             default:             }             if ne, ok := e.(net.Error);
ok && ne.Temporary() {                 // 注：这里对临时性(temporary)错误进行处理                 ... ...                 time.Sleep(tempDelay)                 continue             }             return e         }         ...     }     ... ... }
```
在上面代码中，Accept
方法实际上返回的错误类型为*OpError，它是
net
包中的一个自定义错误类型，它实现了错误公共特征接口net.Error，如下代码所示：
```
// $GOROOT/src/net/net.go type OpError struct {     ... ...     // Err is the error that occurred during the operation.     Err error } type temporary interface {     Temporary() bool } func (e *OpError) Temporary() bool {   if ne, ok := e.Err.(*os.SyscallError);
ok {       t, ok := ne.Err.(temporary)       return ok && t.Temporary()   }   t, ok := e.Err.(temporary)   return ok && t.Temporary() }
```


## 健壮简洁的函数

**健壮性的“三不要”原则**

**原则一：不要相信任何外部输入的参数。**

为了保证函数的健壮性，函数需要对所有输入的参数进行合法性的检查。一旦发现问题，立即终止函数的执行，返回预设的错误值。

**原则二：不要忽略任何一个错误。**

调用标准库或第三方包提供的函数或方法时，我们不能假定它一定会成功，我们一定要显式地检查这些调用返回的错误值。一旦发现错误，要及时终止函数执行，防止错误继续传播。

**原则三：不要假定异常不会发生。**

通常意义上的异常，指的是硬件异常、操作系统异常、语言运行时异常，还有更大可能是代码中潜在 bug 导致的异常，比如代码中出现了以 0 作为分母，或者是数组越界访问等情况。

**Go 语言的异常：panic**

panic 指的是 Go 程序在运行时出现的一个异常情况。如果异常出现了，但没有被捕获并恢复，Go 程序的执行就会被终止，即便出现异常的位置不在主 Goroutine 中也会这样。

panic 主要有两类来源，一类是来自 **Go 运行时**，另一类则是 **Go 开发人员通过 panic 函数主动触发的**。无论是哪种，一旦 panic 被触发，后续 Go 程序的执行过程都是一样的，这个过程被 Go 语言称为 **panicking**。

以手工调用 panic 函数触发 panic 为例，对 panicking 这个过程进行了诠释：当函数 F 调用 panic 函数时，函数 F 的执行将停止。不过，函数 F 中已进行求值的 deferred 函数都会得到正常执行，执行完这些 deferred 函数后，函数 F 才会把控制权返还给其调用者。

对于函数 F 的调用者而言，函数 F 之后的行为就如同调用者调用的函数是 panic 一样，该panicking过程将继续在栈上进行下去，直到当前 Goroutine 中的所有函数都返回为止，然后 Go 程序将崩溃退出。

```go
func
foo
()
{     println
("call foo")     bar
()     println
("exit foo") }
func
bar
()
{     println
("call bar")     panic
("panic occurs in bar")     zoo
()     println
("exit bar") }
func
zoo
()
{     println
("call zoo")     println
("exit zoo") }
func
main
()
{     println
("call main")     foo
()     println
("exit main") }
```
输出为：
```
call main call foo call bar panic: panic occurs in bar
```
Go
也提供了捕捉
panic
并恢复程序正常执行秩序的方法，我们可以通过
**recover
函数**
来实现这一点。
```go
func bar() {     defer func() {         if e := recover();
e != nil {             fmt.Println("recover the panic:", e)         }     }()     println("call bar")     panic("panic occurs in bar")     zoo()     println("exit bar") }
```
recover
是
Go
内置的专门用于恢复
panic
的函数，它必须被放在一个
defer
函数中才能生效。如果
recover
捕捉到
panic，它就会返回以
panic
的具体内容为错误上下文信息的错误值。如果没有
panic
发生，那么
recover
将返回
nil。而且，如果
panic
被
recover
捕捉到，panic
引发的
panicking
过程就会停止。
```
call
main
call
foo
call
bar
recover
the
panic:
panic
occurs
in
bar
exit
foo
exit
main
```


**如何应对 panic？**

其实大可不必。

***第一点：评估程序对 panic 的忍受度**

首先，我们应该知道一个事实：**不同应用对异常引起的程序崩溃退出的忍受度是不一样的**。

**第二点：提示潜在 bug**

C 语言中有个很好用的辅助函数，断言（assert 宏）。在使用 C 编写代码时，我们经常在一些代码执行路径上，使用断言来表达这段执行路径上某种条件一定为真的信心。

不过，Go 语言标准库中并没有提供断言之类的辅助函数，但我们可以使用 panic，部分模拟断言对潜在 bug 的提示功能。比如，下面就是标准库encoding/json包使用 panic 指示潜在 bug 的一个例子：

```
//
$GOROOT/src/encoding/json/decode.go
...
...
//当一些本不该发生的事情导致我们结束处理时，phasePanicMsg将被用作panic消息
//它可以指示JSON解码器中的bug，或者
//在解码器执行时还有其他代码正在修改数据切片。
const
phasePanicMsg
=
"JSON decoder out of sync - data changing underfoot?"
func
(d *decodeState)
init
(data []byte)
*decodeState
{     d.data = data     d.off = 0     d.savedError = nil     if d.errorContext != nil
{         d.errorContext.Struct = nil         // Reuse the allocated space for the FieldStack slice.         d.errorContext.FieldStack = d.errorContext.FieldStack[:0]     }     return d }
func
(d *decodeState)
valueQuoted
()
interface
{}
{     switch d.opcode
{     default:         panic
(phasePanicMsg)     case scanBeginArray, scanBeginObject:         d.skip
()         d.scanNext
()     case scanBeginLiteral:         v := d.literalInterface
()         switch v.
(type)
{         case nil, string:             return v         }     }     return unquotedValue
{} }
```


在 Go 标准库中，**大多数 panic 的使用都是充当类似断言的作用的**。

**第三点：不要混淆异常与错误**

**使用 defer 简化函数实现**

**Go 中是否有现成的语法元素，可以帮助我们简化 Go 函数的设计和实现**。我也把答案剧透给你，有的，它就是 **defer**。

```go
func
doSomething
()
error
{     var mu sync.Mutex     mu.Lock
()     r1, err := OpenResource1
()     if err != nil
{         mu.Unlock
()         return err     }     r2, err := OpenResource2
()     if err != nil
{         r1.Close
()         mu.Unlock
()         return err     }     r3, err := OpenResource3
()     if err != nil
{         r2.Close
()         r1.Close
()         mu.Unlock
()         return err     }     // 使用r1，r2, r3     err = doWithResources
()      if err != nil
{         r3.Close
()         r2.Close
()         r1.Close
()         mu.Unlock
()         return err     }     r3.Close
()     r2.Close
()     r1.Close
()     mu.Unlock
()     return nil }
```


函数的实现需要确保，无论函数的执行流是按预期顺利进行，还是出现错误，这些资源在函数退出时都要被及时、正确地释放。为此，我们需要尤为关注函数中的错误处理，在错误处理时不能遗漏对资源的释放。

**Go 语言引入 defer 的初衷，就是解决这些问题。**

defer 是 Go 语言提供的一种延迟调用机制，defer 的运作离不开函数。

* 在 Go 中，只有在函数（和方法）内部才能使用 defer；
* defer 关键字后面只能接函数（或方法），这些函数被称为 **deferred 函数**。defer 将它们注册到其所在 Goroutine 中，用于存放 deferred 函数的栈数据结构中，这些 deferred 函数将在执行 defer 的函数退出前，按后进先出（LIFO）的顺序被程序调度执行（如下图所示）。

![image-20250515214246610](/img/go%E5%AD%A6%E4%B9%A0/image-20250515214246610.webp)

deferred 函数是一个可以在任何情况下为函数进行**收尾工作**的好“伙伴”。

**defer 的注意事项**

**第一点：明确哪些函数可以作为 deferred 函数**

对于有返回值的自定义函数或方法，返回值会在 deferred 函数被调度执行的时候被自动丢弃。

Go 语言中除了自定义函数 / 方法，还有 Go 语言内置的 / 预定义的函数，这里我给出了 Go 语言内置函数的完全列表：

```
Functions:
append
cap
close
complex
copy
delete
imag
len
make
new
panic
print
println
real
recover
```
不过，对于那些不能直接作为
deferred
函数的内置函数，我们可以使用一个包裹它的匿名函数来间接满足要求，以
append
为例是这样的：
```
defer
func
()
{   _ = append
(sl, 11) }
()
```


**第二点：注意 defer 关键字后面表达式的求值时机**

**defer 关键字后面的表达式，是在将 deferred 函数注册到 deferred 函数栈的时候进行求值的。而不是在执行的时候求值的。**

```go
func foo1() {     for i := 0;
i <= 3;
i++ {         defer fmt.Println(i)     } } func foo2() {     for i := 0;
i <= 3;
i++ {         defer func(n int) {             fmt.Println(n)         }(i)     } } func foo3() {     for i := 0;
i <= 3;
i++ {         defer func() {             fmt.Println(i)         }()     } } func main() {     fmt.Println("foo1 result:")     foo1()     fmt.Println("\nfoo2 result:")     foo2()     fmt.Println("\nfoo3 result:")     foo3() }
```
输出：
```
foo1 result: 3 2 1 0 foo2 result: 3 2 1 0 foo3 result: 4 4 4 4
```


无论以何种形式将函数注册到 defer 中，deferred 函数的参数值都是在注册的时候进行求值的。只是要注意，defer中访问的直接访问，而不是传递的值。

**第三点：知晓 defer 带来的性能损耗**

## 理解“方法”的本质

Go 语言从设计伊始，就不支持经典的面向对象语法元素，比如类、对象、继承，等等，但 Go 语言仍保留了名为“方法（method）”的语法元素。method 是Go 践行组合设计哲学的一种实现层面的需要。这个我们后面课程会展开细讲，这里你先了解一下就可以了。

![image-20250515215703976](/img/go%E5%AD%A6%E4%B9%A0/image-20250515215703976.webp)

Go 中方法的声明和函数的声明有很多相似之处，我们可以参照着来学习。比如，Go 的方法也是以 func 关键字修饰的，并且和函数一样，也包含方法名（对应函数名）、参数列表、返回值列表与方法体（对应函数体）。

Go 方法的声明有**六个组成部分**，多的一个就是图中的 receiver 部分。在 receiver 部分声明的参数，Go 称之为 receiver 参数，**这个 receiver 参数也是方法与类型之间的纽带，也是方法与函数的最大不同。**

Go 中的**方法必须是归属于一个类型的**，而**receiver 参数的类型就是这个方法归属的类型**，或者说这个方法就是这个类型的一个方法。

比如上面例子，`ListenAndServerTLS`是 `*Server` 类型的方法，但不是`Server`类型的方法。**不过猜也知道，指针相当于引用传递，否则为值传递。**

Go语言不支持重载。

（感觉有点像方法在类外面实现）

```
func
(t *T或T)
MethodName
(参数列表)
(返回值列表)
{     // 方法体 }
```


**方法接收器（receiver）参数、函数 / 方法参数，以及返回值变量对应的作用域范围，都是函数 / 方法体对应的显式代码块**。

receiver 部分的参数名不能与方法参数列表中的形参名，以及具名返回值中的变量名存在冲突，必须在这个方法的作用域中具有唯一性。

```
type
T
struct
{}
func
(t T)
M
(t string)
{ // 编译器报错：duplicate argument t
(重复声明参数t)     ... ... }
```
除了
receiver
参数名字要保证唯一外，Go
语言对
receiver
参数的基类型也有约束，那就是
**receiver
参数的基类型本身不能为指针类型或接口类型**。
```
type
MyInt
*int
func
(r MyInt)
String
()
string
{ // r的基类型为MyInt，编译器报错：invalid receiver type MyInt
(MyInt is a pointer type)     return fmt.Sprintf
("%d", *
(*int)
(r)) }
type
MyReader
io.Reader
func
(r MyReader)
Read
(p []byte)
(int, error)
{ // r的基类型为MyReader，编译器报错：invalid receiver type MyReader
(MyReader is an interface type)     return r.Read
(p) }
```


Go 要求，**方法声明要与 receiver 参数的基类型声明放在同一个包内**。

**我们不能为原生类型（诸如 int、float64、map 等）添加方法**。

**不能跨越 Go 包为其他包的类型声明新方法**。

**方法的本质是什么？**

```go
type
T
struct
{      a int }
func
(t T)
Get
()
int
{       return t.a  }
func
(t *T)
Set
(a int)
int
{      t.a = a      return t.a  }
var
t
T
t.Get
()
(&t).Set
(1)
//
等价于：
var
t
T
T.Get
(t)
(*T).Set
(&t, 1)
```


这种直接以类型名 T 调用方法的表达方式，被称为 **Method Expression**。通过 Method Expression 这种形式，类型 T 只能调用 T 的方法集合（Method Set）中的方法，同理类型 *T 也只能调用 *T 的方法集合中的方法。

**Method Expression** 有些类似于 C++ 中的静态方法（Static Method），C++ 中的静态方法在使用时，以该 C++ 类的某个对象实例作为第一个参数，而 Go 语言的 Method Expression 在使用时，同样以 receiver 参数所代表的类型实例作为第一个参数。

**Go 语言中的方法的本质就是，一个以方法的 receiver 参数作为第一个参数的普通函数**。

```go
func
main
()
{     var t T     f1 :=
(*T).Set // f1的类型，也是*T类型Set方法的类型：func
(t *T, int)int     f2 := T.Get    // f2的类型，也是T类型Get方法的类型：func
(t T)int     fmt.Printf
("the type of f1 is %T\n", f1) // the type of f1 is func
(*main.T, int) int     fmt.Printf
("the type of f2 is %T\n", f2) // the type of f2 is func
(main.T) int     f1
(&t, 3)     fmt.Println
(f2
(t)) // 3 }
```
给出一个例子：
```go
package
main
import
(     "fmt"     "time" )
type
field
struct
{     name string }
func
(p *field)
print
()
{     fmt.Println
(p.name) }
func
main
()
{     data1 := []*field
{
{"one"},
{"two"},
{"three"}}     for _, v := range data1
{         go v.print
()     }     data2 := []field
{
{"four"},
{"five"},
{"six"}}     for _, v := range data2
{         go v.print
()     }     time.Sleep
(3 * time.Second) }
```
在Go
1.22之前可能输出：
```
one
two
three
six
six
six
```
在Go
1.22以及之后可能输出：
```
one
two
three
four
five
six
```


因为标准的改变：[loopvar-preview](https://go.dev/blog/loopvar-preview)

## 方法集合以及 receive 类型

**receiver 参数类型对 Go 方法的影响**

说白了不就是引用传递和值拷贝的区别呗。

**选择 receiver 参数类型的第一个原则**

**如果 Go 方法要把对 receiver 参数代表的类型实例的修改，反映到原类型实例上，那么我们应该选择 *T 作为 receiver 参数的类型**。

**无论是 T 类型实例，还是 *T 类型实例，都既可以调用 receiver 为 T 类型的方法，也可以调用 receiver 为 *T 类型的方法**。

**选择 receiver 参数类型的第二个原则**

**如果 receiver 参数类型的 size 较大**，以值拷贝形式传入就会导致较大的性能开销，这时我们选择 *T 作为 receiver 类型可能更好些。

**方法集合**

```go
type
Interface
interface
{     M1
()     M2
() }
type
T
struct
{}
func
(t T)
M1
()
{}
func
(t *T)
M2
()
{}
func
main
()
{     var t T     var pt *T     var i Interface     i = pt     i = t // cannot use t
(type T) as type Interface in assignment: T does not implement Interface
(M2 method has pointer receiver) }
```


**T 没有实现 Interface 类型方法列表中的 M2，因此类型 T 的实例 t 不能赋值给 Interface 变量**。

同时，**方法集合也是用来判断一个类型是否实现了某接口类型的唯一手段**，可以说，“**方法集合决定了接口实现**”。

**选择 receiver 参数类型的第三个原则**

这个原则的选择依据就是 **T 类型是否需要实现某个接口**，也就是是否存在将 T 类型的变量赋值给某接口类型变量的情况。

**T 类型需要实现某个接口**，那我们就要使用 T 作为 receiver 参数的类型，来满足接口类型方法集合中的所有方法。

## 方法：用类型嵌入模拟“继承”？

**难道还有某种自定义类型的方法不是自己显式实现的吗？**当然有！这就是我们这讲中要重点讲解的内容：**如何让某个自定义类型“继承”其他类型的方法实现**。

**老师，你不是说过 Go 不支持经典的面向对象编程范式吗？怎么还会有继承这一说法呢**？没错！Go 语言从设计伊始，就决定不支持经典面向对象的编程范式与语法元素，所以我们这里只是借用了“继承”这个词汇而已，说是“继承”，实则依旧是一种**组合**的思想。

继承”，我们是通过 Go 语言的**类型嵌入（Type Embedding）**来实现的。

**接口类型的类型嵌入**

**接口类型声明了由一个方法集合代表的接口**

**接口类型 E 替代上面接口类型 I 定义中 M1 和 M2**

**接口类型嵌入的语义就是新接口类型（如接口类型 I）将嵌入的接口类型（如接口类型 E）的方法集合，并入到自己的方法集合中**。

**Go 语言中基于已有接口类型构建新接口类型的惯用法**。

```
//
$GOROOT/src/io/io.go
type
Reader
interface
{     Read
(p []byte)
(n int, err error) }
type
Writer
interface
{     Write
(p []byte)
(n int, err error) }
type
Closer
interface
{     Close
() error }
type
ReadWriter
interface
{     Reader     Writer }
type
ReadCloser
interface
{     Reader     Closer }
type
WriteCloser
interface
{     Writer     Closer }
type
ReadWriteCloser
interface
{     Reader     Writer     Closer }
```




```go
type
Interface1
interface
{     M1
() }
type
Interface2
interface
{     M1
()     M2
() }
type
Interface3
interface
{     Interface1     Interface2 // Error: duplicate method M1 }
type
Interface4
interface
{     Interface2     M2
() // Error: duplicate method M2 }
func
main
()
{ }
```
**结构体类型的类型嵌入**

```go
type S struct {
    A int
    b string
    c T
    p *P
    _ [10]int8
    F func()
}
```
**带有嵌入字段（Embedded
Field）的结构体定义**。
```
type
T1
int
type
t2
struct
{     n int     m int }
type
I
interface
{     M1
() }
type
S1
struct
{     T1     *t2     I                 a int     b string }
```
结构体字段的方式就叫做**结构体的类型嵌入**，这些字段也被叫做**嵌入字段（Embedded
Field）**。
```go
type
MyInt
int
func
(n *MyInt)
Add
(m int)
{     *n = *n + MyInt
(m) }
type
t
struct
{     a int     b int }
type
S
struct
{     *MyInt     t     io.Reader     s string     n int }
func
main
()
{     m := MyInt
(17)     r := strings.NewReader
("hello, go")     s := S
{         MyInt: &m,         t: t
{             a: 1,             b: 2,         },         Reader: r,         s:      "demo",     }     var sl = make
([]byte, len
("hello, go"))     s.Reader.Read
(sl)     fmt.Println
(string
(sl)) // hello, go     s.MyInt.Add
(5)     fmt.Println
(*
(s.MyInt)) // 22 }
```
Go
方法的
receiver
的基类型一样，嵌入字段类型的底层类型不能为指针类型。而且，嵌入字段的名字在结构体定义也必须是唯一的，这也意味这如果两个类型的名字相同，它们无法同时作为嵌入字段放到同一个结构体定义中。不过，这些约束你了解一下就可以了，一旦违反，Go
编译器会提示你的。
```
var
sl
=
make
([]byte, len
("hello, go"))
s.Read
(sl)
fmt.Println
(string
(sl))
s.Add
(5)
fmt.Println
(*
(s.MyInt))
```


上端代码可以正常运行。

**Read 方法与 Add 方法就是类型 S 方法集合中的方法**。

这两个方法就来自结构体类型 S 的两个嵌入字段 Reader 和 MyInt。结构体类型 S“继承”了 Reader 字段的方法 Read 的实现，也“继承”了 *MyInt 的 Add 方法的实现。注意，我这里的“继承”用了引号，说明这并不是真正的继承，它只是 Go 语言的一种“障眼法”。

Go 发现结构体类型 S 自身并没有定义 Read 方法，于是 Go 会查看 S 的嵌入字段对应的类型是否定义了 Read 方法。这个时候，Reader 字段就被找了出来，之后 s.Read 的调用就被转换为 s.Reader.Read 调用。

![image-20250516172428884](/img/go%E5%AD%A6%E4%B9%A0/image-20250516172428884.webp)

**类型嵌入与方法集合**

接口类型只能嵌入接口类型。而结构体类型对嵌入类型的要求就比较宽泛了，可以是任意自定义类型或接口类型。

```go
type
I
interface
{     M1
()     M2
() }
type
T
struct
{     I }
func
(T)
M3
()
{}
func
main
()
{     var t T     var p *T     dumpMethodSet
(t)     dumpMethodSet
(p) }
```
需要无交集：
```go
type
E1
interface
{       M1
()       M2
()       M3
()   }
type
E2
interface
{      M1
()      M2
()      M4
()  }
type
T
struct
{      E1      E2  }
func
main
()
{      t := T
{}      t.M1
()      t.M2
()  }
```
**defined
类型与
alias
类型的方法集合**
```
type
I
interface
{     M1
()     M2
() }
type
T
int
type
NT
T
//
基于已存在的类型T创建新的defined类型NT
type
NI
I
//
基于已存在的接口类型I创建新defined接口类型NI
```
新定义的
defined
类型与原
defined
类型是不同的类型，那么它们的方法集合上又会有什么关系呢？新类型是否“继承”原
defined
类型的方法集合呢？对于那些基于接口类型创建的
defined
的接口类型，它们的方法集合与原接口类型的方法集合是一致的。
```go
package
main
type
T
struct
{}
func
(T)
M1
()
{}
func
(*T)
M2
()
{}
type
T1
T
func
main
()
{   var t T   var pt *T   var t1 T1   var pt1 *T1   dumpMethodSet
(t)   dumpMethodSet
(t1)   dumpMethodSet
(pt)   dumpMethodSet
(pt1) }
```
输出：
```
main.T's method set: - M1 main.T1's method set is empty! *main.T's method set: - M1 - M2 *main.T1's method set is empty!
```
T1
的定义方式由类型声明改成了类型别名
```go
type
T
struct
{}
func
(T)
M1
()
{}
func
(*T)
M2
()
{}
type
T1
=
T
func
main
()
{     var t T     var pt *T     var t1 T1     var pt1 *T1     dumpMethodSet
(t)     dumpMethodSet
(t1)     dumpMethodSet
(pt)     dumpMethodSet
(pt1) }
```
输出：
```
main.T's method set: - M1 main.T's method set: - M1 *main.T's method set: - M1 - M2 *main.T's method set: - M1 - M2
```


无论原类型是接口类型还是非接口类型，类型别名都与原类型拥有完全相同的方法集合。

# 接口

## 接口

**接口类型是由 type 和 interface 关键字定义的一组方法集合**

```
type
MyInterface
interface
{     M1
(int) error     M2
(io.Writer, ...string) }
//
下面两种等价：
type
MyInterface
interface
{     M1
(a int) error     M2
(w io.Writer, strs ...string) }
type
MyInterface
interface
{     M1
(n int) error     M2
(w io.Writer, args ...string) }
```


我们可以看到，接口类型 MyInterface 所表示的接口的方法集合，包含两个方法 M1 和 M2。**之所以称 M1 和 M2 为“方法”，更多是从这个接口的实现者的角度考虑的**。

Go 语言要求接口类型声明中的**方法必须是具名的**，并且**方法名字在这个接口类型的方法集合中是唯一的**。

**在 Go 接口类型的方法集合中放入首字母小写的非导出方法也是合法的**

```
//
$GOROOT/src/context.go
//
A
canceler
is
a
context
type
that
can
be
canceled
directly.
The
//
implementations
are
*cancelCtx
and
*timerCtx.
type
canceler
interface
{     cancel
(removeFromParent bool, err error) // 非导入     Done
() <-chan struct
{} }
```
如果一个接口类型定义中没有一个方法，那么它的方法集合就为空。如：
```
type
EmptyInterface
interface
{ }
```


这个方法集合为空的接口类型就被称为**空接口类型**，但通常我们不需要自己显式定义这类空接口类型，我们直接使用`interface{}`这个类型字面值作为所有空接口类型的代表就可以了。

接口类型一旦被定义后，它就和其他 Go 类型一样可以用于声明变量。这些类型为接口类型的变量被称为**接口类型变量**，如果没有被显式赋予初值，接口类型变量的默认值为 nil。如果要为接口类型变量显式赋予初值，我们就要为接口类型变量选择合法的右值。

Go 规定：**如果一个类型 T 的方法集合是某接口类型 I 的方法集合的等价集合或超集，我们就说类型 T 实现了接口类型 I，那么类型 T 的变量就可以作为合法的右值赋值给接口类型 I 的变量**。

如果一个变量的类型是空接口类型，由于空接口类型的方法集合为空，这就意味着任何类型都实现了空接口的方法集合，所以我们可以将任何类型的值作为右值，赋值给空接口类型的变量，比如下面例子：

```go
var
i
interface
{}
=
15
//
ok
i
=
"hello, golang"
//
ok
type
T
struct
{}
var
t
T
i
=
t
//
ok
i
=
&t
//
ok
```


Go 标准库在内的一些通用数据结构与算法的实现，都使用了空类型interface{}作为数据元素的类型，这样我们就无需为每种支持的元素类型单独做一份代码拷贝了。

Go 语言还支持接口类型变量赋值的“逆操作”，也就是通过接口类型变量“还原”它的右值的类型与值信息，这个过程被称为**“类型断言（Type Assertion）”**。类型断言通常使用下面的语法形式：

```
v,
ok
:=
i.
(T)
```


其中 i 是某一个接口类型变量，如果 T 是一个非接口类型且 T 是想要还原的类型，那么这句代码的含义就是**断言存储在接口类型变量 i 中的值的类型为 T**。

类型断言也支持：

```
v
:=
i.
(T)
```


但如果 i 的类型不是 T 那么会抛出panic

**Go 语言接口定义的惯例，尽量定义“小接口”。**

接口类型的背后，是通过把类型的行为抽象成**契约**，建立双方共同遵守的约定，这种契约将双方的耦合降到了最低的程度。

Go 选择了**去繁就简**的形式，这主要体现在以下两点上：

* **隐式契约，无需签署，自动生效**

  Go 语言中接口类型与它的实现者之间的关系是隐式的，不需要像其他语言（比如 Java）那样要求实现者显式放置“implements”进行修饰，实现者只需要实现接口方法集合中的全部方法便算是遵守了契约，并立即生效了。
* **更倾向于“小契约”**

  这点也不难理解。你想，如果契约太繁杂了就会束缚了手脚，缺少了灵活性，抑制了表现力。所以 Go 选择了使用“小契约”，表现在代码上就是**尽量定义小接口，即方法个数在 1~3 个之间的接口**。Go 语言之父 Rob Pike 曾说过的“接口越大，抽象程度越弱”，这也是 Go 社区倾向定义小接口的另外一种表述。

## 接口的动与静

**接口是 Go 这门静态语言中唯一“动静兼备”的语法特性**。

**接口的静态特性与动态特性**

接口的**静态特性**体现在**接口类型变量具有静态类型**，比如var err error中变量 err 的静态类型为 error。拥有静态类型，那就意味着编译器会在编译阶段对所有接口类型变量的赋值操作进行类型检查，编译器会检查右值的类型是否实现了该接口方法集合中的所有方法。如果不满足，就会报错：

```go
var
err
error
=
1
//
cannot
use
1
(type int)
as
type
error
in
assignment:
int
does
not
implement
error
(missing Error method)
```
而接口的**动态特性**，就体现在接口类型变量在运行时还存储了右值的真实类型信息，这个右值的真实类型被称为接口类型变量的**动态类型**。你看一下下面示例代码：
```go
var
err
error
err
=
errors.New
("error1")
fmt.Printf
("%T\n", err)
//
*errors.errorString
```
由接口实现多态，某种意义上也是纯虚类。
```go
type
QuackableAnimal
interface
{     Quack
() }
type
Duck
struct
{}
func
(Duck)
Quack
()
{     println
("duck quack!") }
type
Dog
struct
{}
func
(Dog)
Quack
()
{     println
("dog quack!") }
type
Bird
struct
{}
func
(Bird)
Quack
()
{     println
("bird quack!") }
func
AnimalQuackInForest
(a QuackableAnimal)
{     a.Quack
()              }
func
main
()
{                  animals := []QuackableAnimal
{new
(Duck), new
(Dog), new
(Bird)}     for _, animal := range animals
{         AnimalQuackInForest
(animal)     }   }
```
接口类型的动静特性让我们看到了接口类型的强大，但在日常使用过程中，很多人都会产生各种困惑，其中最经典的一个困惑莫过于“nil
的
error
值不等于
nil”了。下面我们来详细看一下。
```go
type
MyError
struct
{     error }
var
ErrBad
=
MyError
{     error: errors.New
("bad things happened"), }
func
bad
()
bool
{     return false }
func
returnsError
()
error
{     var p *MyError = nil     if bad
()
{         p = &ErrBad     }     return p }
func
main
()
{     err := returnsError
()     if err != nil
{         fmt.Printf
("error occur: %+v\n", err)         return     }     fmt.Println
("ok") }
```


输出：`error occur: <nil>`

原因是，`err error` 中 `error` 是一个接口类型，那么`err`变成了一个指向`*MyError nil`的`error`被初始化了，所以不是`nil`了。

**接口类型变量的内部表示**

```
//
$GOROOT/src/runtime/runtime2.go
type
iface
struct
{     tab  *itab     data unsafe.Pointer }
type
eface
struct
{     _type *_type     data  unsafe.Pointer }
```


* eface 用于表示没有方法的空接口（**e**mpty inter**face**）类型变量，也就是 interface{}类型的变量；
* iface 用于表示其余拥有方法的接口 **i**nter**face** 类型变量。

这两个结构的共同点是它们都有两个指针字段，并且第二个指针字段的功能相同，都是指向当前赋值给该接口类型变量的动态类型变量的值。

那它们的不同点在哪呢？就在于 eface 表示的空接口类型并没有方法列表，因此它的第一个指针字段指向一个\_type类型结构，这个结构为该接口类型变量的动态类型的信息，它的定义是这样的：

```
//
$GOROOT/src/runtime/type.go
type
_type
struct
{     size       uintptr     ptrdata    uintptr // size of memory prefix holding all pointers     hash       uint32     tflag      tflag     align      uint8     fieldAlign uint8     kind       uint8     // function for comparing objects of this type     //
(ptr to object A, ptr to object B) -> ==?     equal func
(unsafe.Pointer, unsafe.Pointer) bool     // gcdata stores the GC type data for the garbage collector.     // If the KindGCProg bit is set in kind, gcdata is a GC program.     // Otherwise it is a ptrmask bitmap. See mbitmap.go for details.     gcdata    *byte     str       nameOff     ptrToThis typeOff }
```
而
iface
除了要存储动态类型信息之外，还要存储接口本身的信息（接口的类型信息、方法列表信息等）以及动态类型所实现的方法的信息，因此
iface
的第一个字段指向一个itab类型结构。itab
结构的定义如下：
```
//
$GOROOT/src/runtime/runtime2.go
type
itab
struct
{     inter *interfacetype     _type *_type     hash  uint32 // copy of _type.hash. Used for type switches.     _     [4]byte     fun   [1]uintptr // variable sized. fun[0]==0 means _type does not implement inter. }
```


也就是说，我们判断两个接口类型变量是否相同，只需要判断 \_type/tab 是否相同，以及 data 指针指向的内存空间所存储的数据值是否相同就可以了。

引入一些 **helper 函数**。借助这些函数，我们可以清晰地输出接口类型变量的内部表示，这样就可以一目了然地看出两个变量是否相等了。

**第一种：nil 接口变量**

无论是空接口类型还是非空接口类型变量，一旦变量值为 nil，那么它们内部表示均为(0x0,0x0)，也就是类型信息、数据值信息均为空。

**第二种：空接口类型变量**

**对于空接口类型变量，只有 \_type 和 data 所指数据内容一致的情况下，两个空接口类型变量之间才能划等号**。另外，Go 在创建 eface 时一般会为 data 重新分配新内存空间，将动态类型变量的值复制到这块内存空间，并将 data 指针指向这块内存空间。因此我们多数情况下看到的 data 指针值都是不同的。

**第三种：非空接口类型变量**

非空接口类型变量的类型信息并不为空，数据指针为空，因此它与 nil（0x0,0x0）之间不能划等号。

**第四种：空接口类型变量与非空接口类型变量的等值比较**

Go 在进行等值比较时，类型比较使用的是 eface 的 \_type 和 iface 的 tab.\_type，因此就像我们在这个例子中看到的那样，当 eif 和 err 都被赋值为T(5)时，两者之间是划等号的。

**接口类型的装箱（boxing）原理**

**装箱（boxing）**是编程语言领域的一个基础概念，一般是指把一个值类型转换成引用类型，比如在支持装箱概念的 Java 语言中，将一个 int 变量转换成 Integer 对象就是一个装箱操作。

在 Go 语言中，将任意类型赋值给一个接口类型变量也是**装箱**操作。有了前面对接口类型变量内部表示的学习，我们知道**接口类型的装箱实际就是创建一个 eface 或 iface 的过程**。接下来我们就来简要描述一下这个过程，也就是接口类型的装箱原理。

```go
//
interface_internal.go
type
T
struct
{       n int       s string   }
func
(T)
M1
()
{}
func
(T)
M2
()
{}
type
NonEmptyInterface
interface
{       M1
()       M2
()   }
func
main
()
{       var t = T
{           n: 17,           s: "hello, interface",       }       var ei interface
{}       ei = t         var i NonEmptyInterface       i = t       fmt.Println
(ei)       fmt.Println
(i)   }
```


这个例子中，对 ei 和 i 两个接口类型变量的赋值都会触发装箱操作

## **Go 接口的应用模式或惯例**。

Go 语言之父 Rob Pike 曾说过：**如果 C++ 和 Java 是关于类型层次结构和类型分类的语言，那么 Go 则是关于组合的语言。**

**编程语言的语法元素间和语言特性也存在着正交的情况，并且通过将这些正交的特性组合起来，我们可以实现更为高级的特性**。

正交的语法元素：

* Go 语言无类型体系（Type Hierarchy），没有父子类的概念，类型定义是正交独立的；
* 方法和类型是正交的，每种类型都可以拥有自己的方法集合，方法本质上只是一个将 receiver 参数作为第一个参数的函数而已；
* 接口与它的实现者之间无“显式关联”，也就说接口与 Go 语言其他部分也是正交的

在这些正交语法元素当中，**接口作为 Go 语言提供的具有天然正交性的语法元素**，在 Go 程序的静态结构搭建与耦合设计中扮演着至关重要的角色。

组合：

![image-20250516213400509](/img/go%E5%AD%A6%E4%B9%A0/image-20250516213400509.webp)

**垂直组合**

Go 语言通过类型的组合而不是继承让单一类型**承载更多的功能**。由于这种方式与硬件配置升级的垂直扩展很类似，所以这里我们叫它**垂直组合**。

**这样的垂直组合更多应用在新类型的定义方面**。通过这种垂直组合，我们可以达到方法实现的复用、接口定义重用等目的。

**第一种：通过嵌入接口构建接口**

通过在接口定义中嵌入其他接口类型，实现接口行为聚合，组成大接口。

**第二种：通过嵌入接口构建结构体类型**

在结构体中嵌入接口，可以用于快速构建满足某一个接口的结构体类型，来满足某单元测试的需要，之后我们只需要实现少数需要的接口方法就可以了。

**第三种：通过嵌入结构体类型构建新结构体类型**

在结构体中嵌入接口类型名和在结构体中嵌入其他结构体，都是“委派模式（delegate）”的一种应用。对新结构体类型的方法调用，可能会被“委派”给该结构体内部嵌入的结构体的实例，通过这种方式构建的新结构体类型就“继承”了被嵌入的结构体的方法的实现。

嵌入接口类型在内的各种垂直组合更多用于类型定义层面，本质上它是一种**类型组合**，也是一种类型之间的耦合方式。

**水平组合**

```go
func
Save
(f *os.File, data []byte)
error
```


这个函数拓展性太差，依赖于不必要的 `*os.File` 类型。但是 `Save` 函数只需要参数`f`支持`Write()`函数即可。所以应该依赖于抽象（接口），而不是依赖于具体（具体的`*os.File`结构体）

```go
func
Save
(w io.Writer, data []byte)
error
```


这样才对。

**接口应用的几种模式**

通过接口进行水平组合的基本模式就是：**使用接受接口类型参数的函数或方法**。

**基本模式**

```go
func
YourFuncName
(param YourInterfaceType)
```


![image-20250517111748401](/img/go%E5%AD%A6%E4%B9%A0/image-20250517111748401.webp)

**创建模式**

Go 社区流传一个经验法则：“接受接口，返回结构体（Accept interfaces, return structs）”，这其实就是一种把接口作为“关节”的应用模式。这个经验法则多用于创建某一结构体类型的实例。

如：

```go
//
$GOROOT/src/sync/cond.go
type
Cond
struct
{     ... ...     L Locker }
func
NewCond
(l Locker)
*Cond
{     return &Cond
{L: l} }
//
$GOROOT/src/log/log.go
type
Logger
struct
{     mu     sync.Mutex      prefix string          flag   int             out    io.Writer       buf    []byte     }
func
New
(out io.Writer, prefix string, flag int)
*Logger
{     return &Logger
{out: out, prefix: prefix, flag: flag} }
//
$GOROOT/src/log/log.go
type
Writer
struct
{     err error     buf []byte     n   int     wr  io.Writer }
func
NewWriterSize
(w io.Writer, size int)
*Writer
{     // Is it already a Writer?     b, ok := w.
(*Writer)     if ok && len
(b.buf) >= size
{         return b     }     if size <= 0
{         size = defaultBufSize     }     return &Writer
{         buf: make
([]byte, size),         wr:  w,     } }
```


用New当作对外接口，创建一个结构体。

**包装器模式**

在基本模式的基础上，当返回值的类型与参数类型相同时，我们能得到下面形式的函数原型：

```go
func
YourWrapperFunc
(param YourInterfaceType)
YourInterfaceType
```


通过这个函数，我们可以实现对输入参数的类型的包装，并在不改变被包装类型（输入参数类型）的定义的情况下，返回具备新功能特性的、实现相同接口类型的新类型。这种接口应用模式我们叫它**包装器模式**，也叫装饰器模式。包装器多用于对输入数据的过滤、变换等操作。

Go 标准库中一个典型的**包装器模式**的应用：

```go
//
$GOROOT/src/io/io.go
func
LimitReader
(r Reader, n int64)
Reader
{ return &LimitedReader
{r, n} }
type
LimitedReader
struct
{     R Reader // underlying reader     N int64  // max bytes remaining }
func
(l *LimitedReader)
Read
(p []byte)
(n int, err error)
{     // ... ... }
```


通过 LimitReader 函数的包装后，我们得到了一个具有新功能特性的 io.Reader 接口的实现类型，也就是 LimitedReader。这个新类型在 Reader 的语义基础上实现了对读取字节个数的限制。

调用时相当于：`caller <-> limitreader <-> read` 实现包装

相当于功能取并。

**适配器模式**

适配器模式不是基本模式的直接衍生模式。

适配器模式的核心是适配器函数类型（Adapter Function Type）。适配器函数类型是一个辅助水平组合实现的“工具”类型。这里我要再强调一下，**它是一个类型**。它可以将一个满足特定函数签名的普通函数，显式转换成自身类型的实例，转换后的实例同时也是某个接口类型的实现者。

**中间件**

最后，我们来介绍下中间件这个应用模式。中间件（Middleware）这个词的含义可大可小。在 Go Web 编程中，“中间件”常常指的是一个实现了 http.Handler 接口的 http.HandlerFunc 类型实例。实质上，这里的**中间件就是包装模式和适配器模式结合的产物**。

```go
func
validateAuth
(s string)
error
{     if s != "123456"
{         return fmt.Errorf
("%s", "bad auth token")     }     return nil }
func
greetings
(w http.ResponseWriter, r *http.Request)
{     fmt.Fprintf
(w, "Welcome!") }
func
logHandler
(h http.Handler)
http.Handler
{     return http.HandlerFunc
(func
(w http.ResponseWriter, r *http.Request)
{         t := time.Now
()         log.Printf
("[%s] %q %v\n", r.Method, r.URL.String
(), t)         h.ServeHTTP
(w, r)     }) }
func
authHandler
(h http.Handler)
http.Handler
{     return http.HandlerFunc
(func
(w http.ResponseWriter, r *http.Request)
{         err := validateAuth
(r.Header.Get
("auth"))         if err != nil
{             http.Error
(w, "bad auth param", http.StatusUnauthorized)             return         }         h.ServeHTTP
(w, r)     }) }
func
main
()
{     http.ListenAndServe
(":8080", logHandler
(authHandler
(http.HandlerFunc
(greetings)))) }
```


所谓中间件（如：logHandler、authHandler）本质就是一个包装函数（支持链式调用），但它的内部利用了适配器函数类型（http.HandlerFunc），将一个普通函数（比如例子中的几个匿名函数）转型为实现了 http.Handler 的类型的实例。

**尽量避免使用空接口作为函数参数类型**

# 并发

“Go 并发”这个词拆开来看，它包含两方面内容，一个是并发的概念，另一个是 Go 针对并发设计给出的自身的实现方案，也就是 goroutine、channel、select 这些 Go 并发的语法特性。

**这种将程序分成多个可独立执行的部分的结构化程序的设计方法，就是并发设计**。

**并发不是并行，并发关乎结构，并行关乎执行**。

并发考虑的是如何将应用划分为多个互相配合的、可独立执行的模块的问题。采用并发设计的程序并不一定是并行执行的。

**Go 的并发方案：goroutine**

Go 并没有使用操作系统线程作为承载分解后的代码片段（模块）的基本执行单元，而是实现了goroutine这一**由 Go 运行时（runtime）负责调度的、轻量的用户级线程**，为并发程序设计提供原生支持。

Go 语言通过go关键字+函数/方法的方式创建一个 goroutine。创建后，新 goroutine 将拥有独立的代码执行流，并与创建它的 goroutine 一起被 Go 运行时调度。

```
go
fmt.Println
("I am a goroutine")
var
c
=
make
(chan int)
go
func
(a, b int)
{     c <- a + b }
(3,4)
//
$GOROOT/src/net/http/server.go
c
:=
srv.newConn
(rw)
go
c.serve
(connCtx)
```


创建 goroutine 后，go 关键字不会返回 goroutine id 之类的唯一标识 goroutine 的 id，你也不要尝试去得到这样的 id 并依赖它。

多数情况下，我们不需要考虑对 goroutine 的退出进行控制：**goroutine 的执行函数的返回，就意味着 goroutine 退出。**

**goroutine 间的通信**

我们可以说传统语言的并发模型是**基于对内存的共享的**。

Go 语言从设计伊始，就将解决上面这个传统并发模型的问题作为 Go 的一个目标，并在新并发模型设计中借鉴了著名计算机科学家Tony Hoare提出的 **CSP（Communicationing Sequential Processes，通信顺序进程）**并发模型。

在 Tony Hoare 眼中，**一个符合 CSP 模型的并发程序应该是一组通过输入输出原语连接起来的 P 的集合**。

**Go 始终推荐以 CSP 并发模型风格构建并发程序**

**Goroutine 调度器**

Goroutine 调度器的实现不是一蹴而就的，它的调度模型与算法也是几经演化，从最初的 G-M 模型、到 G-P-M 模型，从不支持抢占，到支持协作式抢占，再到支持基于信号的异步抢占，Goroutine 调度器经历了不断地优化与打磨。

![image-20250517155122487](/img/go%E5%AD%A6%E4%B9%A0/image-20250517155122487.webp)

有人说过：**“计算机科学领域的任何问题都可以通过增加一个间接的中间层来解决。”**

* G: 代表 Goroutine，存储了 Goroutine 的执行栈信息、Goroutine 状态以及 Goroutine 的任务函数等，而且 G 对象是可以重用的；
* P: 代表逻辑 processor，P 的数量决定了系统内最大可并行的 G 的数量，P 的最大作用还是其拥有的各种 G 对象队列、链表、一些缓存和状态；
* M: M 代表着真正的执行计算资源。在绑定有效的 P 后，进入一个调度循环，而调度循环的机制大致是**从 P 的本地运行队列以及全局队列中获取 G，切换到 G 的执行栈上并执行 G 的函数，调用 goexit 做清理工作并回到 M，如此反复**。M 并不保留 G 状态，这是 G 可以跨 M 调度的基础。

**G 被抢占调度**

除非极端的无限循环，否则只要 G 调用函数，Go 运行时就有了抢占 G 的机会。

## channel

**创建 channel**

和切片、结构体、map 等一样，channel 也是一种复合数据类型。也就是说，我们在声明一个 channel 类型变量时，必须给出其具体的元素类型。

`var ch chan int`

如果 channel 类型变量在声明时没有被赋予初值，那么它的默认值为 nil。并且，和其他复合数据类型支持使用复合类型字面值作为变量初始值不同，为 channel 类型变量赋初值的唯一方法就是使用 **make** 这个 Go 预定义的函数，比如下面代码：

```
ch1
:=
make
(chan int)
//
无缓冲的channel
ch2
:=
make
(chan int, 5)
//
有缓冲的channel
```


这两种类型的变量关于发送（send）与接收（receive）的特性是不同的。

**发送与接收**

Go 提供了<-操作符用于对 channel 类型变量进行发送与接收操作：

```
ch1
<-
13
//
将整型字面值13发送到无缓冲channel类型变量ch1中
n
:=
<-
ch1
//
从无缓冲channel类型变量ch1中接收一个整型值存储到整型变量n中
ch2
<-
17
//
将整型字面值17发送到带缓冲channel类型变量ch2中
m
:=
<-
ch2
//
从带缓冲channel类型变量ch2中接收一个整型值存储到整型变量m中
```


**channel 是用于 Goroutine 间通信的**，所以绝大多数对 channel 的读写都被分别放在了不同的 Goroutine 中。

由于无缓冲 channel 的运行时层实现不带有缓冲区，所以 Goroutine 对无缓冲 channel 的接收和发送操作是同步的。也就是说，对同一个无缓冲 channel，只有对它进行接收操作的 Goroutine 和对它进行发送操作的 Goroutine 都存在的情况下，通信才能得以进行，否则单方面的操作会让对应的 Goroutine 陷入挂起状态，比如下面示例代码：

```go
func
main
()
{     ch1 := make
(chan int)     ch1 <- 13 // fatal error: all goroutines are asleep - deadlock!     n := <-ch1     println
(n) }
```


上面出现错误：提示我们所有 Goroutine 都处于休眠状态，程序处于死锁状态。

要想解除这种错误状态，我们只需要将接收操作，或者发送操作放到另外一个 Goroutine 中就可以了，比如下面代码：

```go
func
main
()
{     ch1 := make
(chan int)     go func
()
{         ch1 <- 13 // 将发送操作放入一个新goroutine中执行     }
()     n := <-ch1     println
(n) }
```


结论：**对无缓冲 channel 类型的发送与接收操作，一定要放在两个不同的 Goroutine 中进行，否则会导致 deadlock**。

和无缓冲 channel 相反，带缓冲 channel 的运行时层实现带有缓冲区，因此，对带缓冲 channel 的发送操作在缓冲区未满、接收操作在缓冲区非空的情况下是**异步**的（发送或接收不需要阻塞等待）。

对一个带缓冲 channel 来说，在缓冲区未满的情况下，对它进行发送操作的 Goroutine 并不会阻塞挂起；在缓冲区有数据的情况下，对它进行接收操作的 Goroutine 也不会阻塞挂起。

```
ch2
:=
make
(chan int, 1)
n
:=
<-ch2
//
由于此时ch2的缓冲区中无数据，因此对其进行接收操作将导致goroutine挂起
ch3
:=
make
(chan int, 1)
ch3
<-
17
//
向ch3发送一个整型数17
ch3
<-
27
//
由于此时ch3中缓冲区已满，再向ch3发送数据也将导致goroutine挂起
```
使用操作符<-，我们还可以声明**只发送
channel
类型**（send-only）和**只接收
channel
类型**（recv-only），我们接着看下面这个例子：
```
ch1
:=
make
(chan<- int, 1)
//
只发送channel类型
ch2
:=
make
(<-chan int, 1)
//
只接收channel类型
<-ch1
//
invalid
operation:
<-ch1
(receive from send-only type chan<- int)
ch2
<-
13
//
invalid
operation:
ch2
<-
13
(send to receive-only type <-chan int)
```
试图从一个只发送
channel
类型变量中接收数据，或者向一个只接收
channel
类型发送数据，都会导致编译错误。通常只发送
channel
类型和只接收
channel
类型，会被用作函数的参数类型或返回值，用于限制对
channel
内的操作，或者是明确可对
channel
进行的操作的类型，比如下面这个例子：
```go
func produce(ch chan<- int) {     for i := 0;
i < 10;
i++ {         ch <- i + 1         time.Sleep(time.Second)     }     close(ch) // 关闭 } func consume(ch <-chan int) {     for n := range ch {         println(n)     } } func main() {     ch := make(chan int, 5)     var wg sync.WaitGroup     wg.Add(2)     go func() {         produce(ch)         wg.Done()     }()     go func() {         consume(ch)         wg.Done()     }()     wg.Wait() }
```
**关闭
channel**
```
n
:=
<-
ch
//
当ch被关闭后，n将被赋值为ch元素类型的零值
m,
ok
:=
<-ch
//
当ch被关闭后，m将被赋值为ch元素类型的零值,
ok值为false
for
v
:=
range
ch
{ // 当ch被关闭后，for range循环结束     ... ... }
```


produce 函数在发送完数据后，调用 Go 内置的 close 函数关闭了 channel。channel 关闭后，所有等待从这个 channel 接收数据的操作都将返回。

通过“comma, ok”惯用法或 for range 语句，我们可以准确地判定 channel 是否被关闭。而单纯采用n := <-ch形式的语句，我们就无法判定从 ch 返回的元素类型零值，究竟是不是因为 channel 被关闭后才返回的。

channel 是在 produce 函数中被关闭的，这也是 channel 的一个使用惯例，那就是**发送端负责关闭 channel**。

发送端没有像接受端那样的、可以安全判断 channel 是否被关闭了的方法。同时，一旦向一个已经关闭的 channel 执行发送操作，这个操作就会引发 panic，比如下面这个示例：

```
ch
:=
make
(chan int, 5)
close
(ch)
ch
<-
13
//
panic:
send
on
closed
channel
```


**select**

当涉及同时对多个 channel 进行操作时，我们会结合 Go 为 CSP 并发模型提供的另外一个原语 **select**，一起使用。

通过 select，我们可以同时在多个 channel 上进行发送 / 接收操作：

```
select
{ case x := <-ch1:     // 从channel ch1接收数据   ... ... case y, ok := <-ch2: // 从channel ch2接收数据，并根据ok值判断ch2是否已经关闭   ... ... case ch3 <- z:       // 将z值发送到channel ch3中:   ... ... default:             // 当上面case中的channel通信均无法实施时，执行该默认分支 }
```


当 select 语句中没有 default 分支，而且所有 case 中的 channel 操作都阻塞了的时候，整个 select 语句都将被阻塞，直到某一个 case 上的 channel 变成可发送，或者某个 case 上的 channel 变成可接收，select 语句才可以继续进行下去。

看到这里你应该能感受到，channel 和 select 两种原语的操作都十分简单，它们都遵循了 Go 语言**“追求简单”**的设计哲学，但它们却为 Go 并发程序带来了强大的表达能力。学习了这些基础用法后，接下来我们再深一层，看看 Go 并发原语 channel 的一些惯用法。同样地，这里我们也分成无缓冲 channel 和带缓冲 channel 两种情况来分析。

**无缓冲 channel 的惯用法**

无缓冲 channel 兼具通信和同步特性，在并发程序中应用颇为广泛。

**第一种用法：用作信号传递**

无缓冲 channel 用作信号传递的时候，有两种情况，分别是 1 对 1 通知信号和 1 对 n 通知信号。我们先来分析下 1 对 1 通知信号这种情况。

```go
type
signal
struct
{}
func
worker
()
{     println
("worker is working...")     time.Sleep
(1 * time.Second) }
func
spawn
(f func
())
<-chan
signal
{     c := make
(chan signal)     go func
()
{         println
("worker start to work...")         f
()         c <- signal
(struct
{}
{})     }
()     return c }
func
main
()
{     println
("start a worker...")     c := spawn
(worker)     <-c     fmt.Println
("worker work done!") }
```
有些时候，无缓冲
channel
还被用来实现
**1
对
n
的信号通知**机制。这样的信号通知机制，常被用于协调多个
Goroutine
一起工作
```go
func worker(i int) {     fmt.Printf("worker %d: is working...\n", i)     time.Sleep(1 * time.Second)     fmt.Printf("worker %d: works done\n", i) } func spawnGroup(f func(i int), num int, groupSignal <-chan signal) <-chan signal {     c := make(chan signal)     var wg sync.WaitGroup     for i := 0;
i < num;
i++ {         wg.Add(1)         go func(i int) {             <-groupSignal             fmt.Printf("worker %d: start to work...\n", i)             f(i)             wg.Done()         }(i + 1)     }     go func() {         wg.Wait()         c <- signal(struct{}{})     }()     return c } func main() {     fmt.Println("start a group of workers...")     groupSignal := make(chan signal)     c := spawnGroup(worker, 5, groupSignal)     time.Sleep(5 * time.Second)     fmt.Println("the group of workers start to work...")     close(groupSignal)     <-c     fmt.Println("the group of workers work done!") }
```


这个例子中，main goroutine 创建了一组 5 个 worker goroutine，这些 Goroutine 启动后会阻塞在名为 groupSignal 的无缓冲 channel 上。

**第二种用法：用于替代锁机制**

无缓冲 channel 具有同步特性，这让它在某些场合可以替代锁，让我们的程序更加清晰，可读性也更好。我们可以对比下两个方案，直观地感受一下。

```go
type counter struct {     c chan int     i int } func NewCounter() *counter {     cter := &counter{         c: make(chan int),     }     go func() {         for {             cter.i++             cter.c <- cter.i         }     }()     return cter } func (cter *counter) Increase() int {     return <-cter.c } func main() {     cter := NewCounter()     var wg sync.WaitGroup     for i := 0;
i < 10;
i++ {         wg.Add(1)         go func(i int) {             v := cter.Increase()             fmt.Printf("goroutine-%d: current counter value is %d\n", i, v)             wg.Done()         }(i)     }     wg.Wait() }
```


我们将计数器操作全部交给一个独立的 Goroutine 去处理，并通过无缓冲 channel 的同步阻塞特性，实现了计数器的控制。这样其他 Goroutine 通过 Increase 函数试图增加计数器值的动作，实质上就转化为了一次无缓冲 channel 的接收动作。

**带缓冲 channel 的惯用法**

带缓冲的 channel 与无缓冲的 channel 的最大不同之处，就在于它的**异步性**。

**第一种用法：用作消息队列**

无缓冲 channel 更多用于信号 / 事件管道相比，可自行设置容量、异步收发的带缓冲 channel 更适合被用作为消息队列，并且，带缓冲 channel 在数据收发的性能上要明显好于无缓冲 channel。

* 无论是 1 收 1 发还是多收多发，带缓冲 channel 的收发性能都要好于无缓冲 channel；
* 对于带缓冲 channel 而言，发送与接收的 Goroutine 数量越多，收发性能会有所下降；
* 对于带缓冲 channel 而言，选择适当容量会在一定程度上提升收发性能。

**第二种用法：用作计数信号量（counting semaphore）**

Go 并发设计的一个惯用法，就是将带缓冲 channel 用作计数信号量（counting semaphore）。带缓冲 channel 中的当前数据个数代表的是，当前同时处于活动状态（处理业务）的 Goroutine 的数量，而带缓冲 channel 的容量（capacity），就代表了允许同时处于活动状态的 Goroutine 的最大数量。向带缓冲 channel 的一个发送操作表示获取一个信号量，而从 channel 的一个接收操作则表示释放一个信号量。

```go
var active = make(chan struct{}, 3) var jobs = make(chan int, 10) func main() {     go func() {         for i := 0;
i < 8;
i++ {             jobs <- (i + 1)         }         close(jobs)     }()     var wg sync.WaitGroup     for j := range jobs {         wg.Add(1)         go func(j int) {             active <- struct{}{}             log.Printf("handle job: %d\n", j)             time.Sleep(2 * time.Second)             <-active             wg.Done()         }(j)     }     wg.Wait() }
```


这个示例创建了一组 Goroutine 来处理 job，同一时间允许最多 3 个 Goroutine 处于活动状态。

这个示例使用了一个容量（capacity）为 3 的带缓冲 channel: **active** 作为计数信号量，这意味着允许同时处于**活动状态**的最大 Goroutine 数量为 3。

**len(channel) 的应用**

**len** 是 Go 语言的一个内置函数，它支持接收数组、切片、map、字符串和 channel 类型的参数，并返回对应类型的“长度”，也就是一个整型值。

针对 channel ch 的类型不同，len(ch) 有如下两种语义：

* 当 ch 为无缓冲 channel 时，len(ch) 总是返回 0；
* 当 ch 为带缓冲 channel 时，len(ch) 返回当前 channel ch 中尚未被读取的元素个数。

channel 原语用于多个 Goroutine 间的通信，一旦多个 Goroutine 共同对 channel 进行收发操作，len(channel) 就会在多个 Goroutine 间形成“竞态”。单纯地依靠 len(channel) 来判断 channel 中元素状态，是不能保证在后续对 channel 的收发时 channel 状态是不变的。这是因为，判断状态和执行操作，这不是原子的。

为了正常运行，常见的方法是将“判空与读取”放在一个“事务”中，将“判满与写入”放在一个“事务”中，而这类“事务”我们可以通过 select 实现。

```go
func
tryRecv
(c <-chan int)
(int, bool)
{     select
{     case i := <-c:         return i, true     default:         return 0, false     } }
func
trySend
(c chan<- int, i int)
bool
{     select
{     case c <- i:         return true     default:         return false     } }
```


但是这种方法有一个“问题”，那就是它改变了 channel 的状态，会让 channel 接收了一个元素或发送一个元素到 channel。

如果只想侦测 channel 状态，只能用 len(channel)

**nil channel 的妙用**

如果一个 channel 类型变量的值为 nil，我们称它为 **nil channel**。nil channel 有一个特性，那就是对 nil channel 的读写都会发生阻塞。

```go
func
main
()
{   var c chan int   <-c //阻塞 }
或者：
func
main
()
{   var c chan int   c<-1  //阻塞 }
```


因为 `channel close`之后，接收方还是可以接收，不会阻塞。

但是 `channel nil` 之后，接收方就会阻塞了。

在 `select` 块中比较有用。

```go
func
main
()
{     ch1, ch2 := make
(chan int), make
(chan int)     go func
()
{         time.Sleep
(time.Second * 5)         ch1 <- 5         close
(ch1)     }
()     go func
()
{         time.Sleep
(time.Second * 7)         ch2 <- 7         close
(ch2)     }
()     for
{         select
{         case x, ok := <-ch1:             if !ok
{                 ch1 = nil             } else
{                 fmt.Println
(x)             }         case x, ok := <-ch2:             if !ok
{                 ch2 = nil             } else
{                 fmt.Println
(x)             }         }         if ch1 == nil && ch2 == nil
{             break         }     }     fmt.Println
("program end") }
```


**对一个 nil channel 执行获取操作，这个操作将阻塞**。

**与 select 结合使用的一些惯用法**

**第一种用法：利用 default 分支避免阻塞**

**第二种用法：实现超时机制**

```go
func
worker
()
{   select
{   case <-c:        // ... do some stuff   case <-time.After
(30 *time.Second):       return   } }
```


Go 语言标准库提供的 timer 实际上是由 Go 运行时自行维护的，而不是操作系统级的定时器资源，它的使用代价要比操作系统级的低许多。但即便如此，作为 time.Timer 的使用者，我们也要尽量减少在使用 Timer 时给 Go 运行时和 Go 垃圾回收带来的压力，要及时调用 timer 的 Stop 方法回收 Timer 资源。

**第三种用法：实现心跳机制**

结合 time 包的 Ticker，我们可以实现带有心跳机制的 select。这种机制让我们可以在监听 channel 的同时，执行一些**周期性的任务**，比如下面这段代码：

```go
func
worker
()
{   heartbeat := time.NewTicker
(30 * time.Second)   defer heartbeat.Stop
()   for
{     select
{     case <-c:       // ... do some stuff     case <- heartbeat.C:       //... do heartbeat stuff     }   } }
```


## 共享

**sync 包低级同步原语可以用在哪？**

一般情况下，建议优先使用 CSP 并发模型进行并发程序设计。但是在下面一些场景中，我们依然需要 sync 包提供的低级同步原语。

**首先是需要高性能的临界区（critical section）同步机制场景。**

在 Go 中，channel 并发原语也可以用于对数据对象访问的同步，我们可以把 channel 看成是一种高级的同步原语，它自身的实现也是建构在低级同步原语之上的。也正因为如此，channel 自身的性能与低级同步原语相比要略微逊色，开销要更大。

**第二种就是在不想转移结构体对象所有权，但又要保证结构体内部状态数据的同步访问的场景。**

基于 channel 的并发设计，有一个特点：在 Goroutine 间通过 channel 转移数据对象的所有权。所以，只有拥有数据对象所有权（从 channel 接收到该数据）的 Goroutine 才可以对该数据对象进行状态变更。

如果你的设计中没有转移结构体对象所有权，但又要保证结构体内部状态数据在多个 Goroutine 之间同步访问，那么你可以使用 sync 包提供的低级同步原语来实现，比如最常用的sync.Mutex。

**sync 包中同步原语使用的注意事项**

在 sync 包的注释中（在$GOROOT/src/sync/mutex.go文件的头部注释），我们看到这样一行说明：`// Values containing the types defined in this package should not be copied.`

翻译过来就是：“不应复制那些包含了此包中类型的值”。

那么，为什么首次使用 Mutex 等 sync 包中定义的结构类型后，我们不应该再对它们进行复制操作呢？我们以 Mutex 这个同步原语为例，看看它的实现是怎样的。

Go 标准库中 sync.Mutex 的定义是这样的：

```
//
$GOROOT/src/sync/mutex.go
type
Mutex
struct
{     state int32  // state：表示当前互斥锁的状态；     sema  uint32 // sema：用于控制锁状态的信号量。 }
```


初始情况下，Mutex 的实例处于 **Unlocked** 状态（state 和 sema 均为 0）。对 Mutex 实例的复制也就是两个整型字段的复制。一旦发生复制，原变量与副本就是两个单独的内存块，各自发挥同步作用，互相就没有了关联。

因为发生复制后，原变量与副本保护就是两个无关联的Mutex了，应该使用指针传递。

如果对使用过的、sync 包中的类型的示例进行复制，并使用了复制后得到的副本，将导致不可预期的结果。所以，在使用 sync 包中的类型的时候，我们推荐通过**闭包**方式，或者是**传递类型实例（或包裹该类型的类型实例）的地址（指针）**的方式进行。这就是使用 sync 包时最值得我们注意的事项。

**互斥锁（Mutex）还是读写锁（RWMutex）？**

**互斥锁** ：

```go
var
mu
sync.Mutex
mu.Lock
()
//
加锁
doSomething
()
mu.Unlock
()
//
解锁
```


互斥锁的两个原则：

* **尽量减少在锁中的操作**。这可以减少其他因 Goroutine 阻塞而带来的损耗与延迟。
* **一定要记得调用 Unlock 解锁**。忘记解锁会导致程序局部死锁，甚至是整个程序死锁，会导致严重的后果。同时，我们也可以结合第 23 讲学习到的 defer，优雅地执行解锁操作。

**读写锁：**

```go
var
rwmu
sync.RWMutex
rwmu.RLock
()
//加读锁
readSomething
()
rwmu.RUnlock
()
//解读锁
rwmu.Lock
()
//加写锁
changeSomething
()
rwmu.Unlock
()
//解写锁
```


**互斥锁（Mutex）是临时区同步原语的首选**，它常被用来对结构体对象的内部状态、缓存等进行保护，是使用最为广泛的临界区同步原语。相比之下，读写锁的应用就没那么广泛了，只活跃于它擅长的场景下。

**读写锁适合应用在具有一定并发量且读多写少的场合**。在大量并发读的情况下，多个 Goroutine 可以同时持有读锁，从而减少在锁竞争中等待的时间。

**条件变量**

sync.Cond是传统的条件变量原语概念在 Go 语言中的实现。我们可以把一个条件变量理解为一个容器，这个容器中存放着一个或一组等待着某个条件成立的 Goroutine。

用来对条件进行轮询的时候使用。

使用方法如下：

```go
type signal struct{} var ready bool func worker(i int) {   fmt.Printf("worker %d: is working...\n", i)   time.Sleep(1 * time.Second)   fmt.Printf("worker %d: works done\n", i) } func spawnGroup(f func(i int), num int, groupSignal *sync.Cond) <-chan signal {   c := make(chan signal)   var wg sync.WaitGroup   for i := 0;
i < num;
i++ {     wg.Add(1)     go func(i int) {       groupSignal.L.Lock()       for !ready {         groupSignal.Wait()       }       groupSignal.L.Unlock()       fmt.Printf("worker %d: start to work...\n", i)       f(i)       wg.Done()     }(i + 1)   }   go func() {     wg.Wait()     c <- signal(struct{}{})   }()   return c } func main() {   fmt.Println("start a group of workers...")   groupSignal := sync.NewCond(&sync.Mutex{})   c := spawnGroup(worker, 5, groupSignal)   time.Sleep(5 * time.Second) // 模拟ready前的准备工作   fmt.Println("the group of workers start to work...")   groupSignal.L.Lock()   ready = true   groupSignal.Broadcast()   groupSignal.L.Unlock()   <-c   fmt.Println("the group of workers work done!") }
```


sync.Cond实例的初始化，需要一个满足实现了sync.Locker接口的类型实例，通常我们使用sync.Mutex。

条件变量需要这个互斥锁来同步临界区，保护用作条件的数据。加锁后，各个等待条件成立的 Goroutine 判断条件是否成立，如果不成立，则调用sync.Cond的 Wait 方法进入等待状态。Wait 方法在 Goroutine 挂起前会进行 Unlock 操作。

和sync.Mutex 、sync.RWMutex等相比，sync.Cond 应用的场景更为有限，只有在需要“等待某个条件成立”的场景下，Cond 才有用武之地。

**原子操作（atomic operations）**

atomic 包提供了两大类原子操作接口，一类是针对整型变量的，包括有符号整型、无符号整型以及对应的指针类型；另外一类是针对自定义类型的。因此，第一类原子操作接口的存在让 atomic 包天然适合去实现某一个共享整型变量的并发同步。

atomic 原子操作的特性：随着并发量提升，使用 atomic 实现的**共享变量**的并发读写性能表现更为稳定，尤其是原子读操作，和 sync 包中的读写锁原语比起来，atomic 表现出了更好的伸缩性和高性能。

atomic 包更适合**一些对性能十分敏感、并发量较大且读多写少的场合**。
