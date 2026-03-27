---
date: '2025-05-18T10:44:22.000Z'
tags:
- 已完成
- 学习
- Rust
categories:
- 编程语言
title: Rust学习
slug: lang-rust-learn
summary: 按照《Rust 程序设计语言》的脉络整理 Rust 基础语法、所有权、结构体、枚举与常用语言特性。
commentTerm: "Rust学习 | DogDu's blog"
commentDiscussionNumber: 27
lastmod: '2025-06-22T04:19:41.348Z'
featureimage: "images/covers/cover_08_mountain.webp"
---
这篇文章是跟着《Rust 程序设计语言》做的一份学习笔记，主要记录我在入门阶段觉得最需要反复确认的语法和概念。

参考资料：[Rust 程序设计语言（简体中文版）](https://kaisery.github.io/trpl-zh-cn/title-page.html)


<!--more-->

# 常见编程概念

## 变量

**变量**

变量默认是不可改变的（immutable）。

在变量前面添加 `mut` 可以声明其可变。

如：

**常量**

类似于不可变变量，*常量 (constants)* 是绑定到一个名称的不允许改变的值，不过常量与变量还是有一些区别。

不允许对常量使用 `mut`。声明常量使用 `const` 关键字而不是 `let`，并且 *必须* 注明值的类型。常量只能被设置为常量表达式，而不可以是其他任何只能在运行时计算出的值。

如：

`const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;`

Rust 对常量的命名约定是在单词之间使用全大写加下划线。

常量可以在任意作用域进行定义，其生命周期贯穿整个程序的生命周期。编译时编译器会尽可能将其内联到代码中，所以在不同地方对同一常量的引用并不能保证引用到相同的内存地址

**全局变量**

静态常量，全局常量可以在程序的任何一个部分使用，因为他是静态的。

```rust
const MAX_ID: usize = usize::MAX / 2;

fn main() {
    println!("用户ID允许的最大值是{}", MAX_ID);
}
```
静态变量允许声明一个全局的变量，常用于全局数据统计。
```rust
static mut REQUEST_RECV: usize = 0;

fn main() {
    unsafe {
        REQUEST_RECV += 1;
        assert_eq!(REQUEST_RECV, 1);
    }
}
```


Rust 要求必须使用`unsafe`语句块才能访问和修改`static`变量，因为这种使用方式往往并不安全。

静态变量不会被内联，在整个程序中，静态变量只有一个实例，所有的引用都会指向同一个地址

**遮蔽**

可以定义一个与之前变量同名的新变量。称之为第一个变量被第二个 **遮蔽（Shadowing）** 了，这意味着当您使用变量的名称时，编译器将看到第二个变量。

可以用相同变量名称来遮蔽一个变量，以及重复使用 `let` 关键字来多次遮蔽。

当不小心尝试对变量重新赋值时，如果没有使用 `let` 关键字，就会导致编译时错误。

通过使用 `let`，我们可以用这个值进行一些计算，不过计算完之后变量仍然是不可变的。

`mut` 与遮蔽的另一个区别是，当再次使用 `let` 时，实际上创建了一个新变量，我们可以改变值的类型，并且复用这个名字。

## 数据类型

Rust 是 **静态类型**（*statically typed*）语言，也就是说在编译时就必须知道所有变量的类型。根据值及其使用方式，编译器通常可以推断出我们想要用的类型。

当多种类型均有可能时，必须增加类型注解。

### 标量

**标量**（*scalar*）类型代表一个单独的值。Rust 有四种基本的标量类型：整型、浮点型、布尔类型和字符类型。

**整型**

`isize` 和 `usize` 类型依赖运行程序的计算机架构：64 位架构上它们是 64 位的，32 位架构上它们是 32 位的。

数字字面值允许使用类型后缀，例如 `57u8` 来指定类型

允许使用 `_` 做为分隔符以方便读数

整数溢出：

`release`下不会检测，但是`debug`下会检测，并抛出`panic`。

**浮点型**

默认为 `f64`，也有 `f32`

**数值运算**

支持基本数学运算：加法、减法、乘法、除法和取余。整数除法会向零舍入到最接近的整数。

`let truncated = -5 / 3; // 结果为 -1`

**布尔类型**

`false` 和 `true`

**字符类型**

Rust 的 `char` 类型是语言中最原始的字母类型。

```rust
let c = 'z';
let z: char = 'ℤ'; // with explicit type annotation
let heart_eyed_cat = '😻';
```


单引号声明 `char` 字面值，而与之相反的是，使用双引号声明字符串字面值。

Rust 的 `char` 类型的大小为四个字节 (four bytes)，并代表了一个 Unicode 标量值（Unicode Scalar Value），这意味着它可以比 ASCII 表示更多内容。

### 复合类型

**复合类型**（*Compound types*）可以将多个值组合成一个类型。Rust 有两个原生的复合类型：元组（tuple）和数组（array）。

**元组类型**

元组是一个将多个不同类型的值组合进一个复合类型的主要方式。

元组长度固定：一旦声明，其长度不会增大或缩小。

元组创建：

`let tup: (i32, f64, u8) = (500, 6.4, 1);`

从元组中获取单个值，可以使用模式匹配（pattern matching）来解构（destructure）元组值。

`let tup = (500, 6.4, 1);`

`let (x, y, z) = tup;`

`let (x, y, z) = (1, 1.1, 3);`

`let` 和一个模式将 `tup` 分成了三个不同的变量，`x`、`y` 和 `z`。这叫做 **解构**（*destructuring*），因为它将一个元组拆成了三个部分。

访问：使用点号（`.`）后跟值的索引来直接访问所需的元组元素。

```rust
let x: (i32, f64, u8) = (500, 6.4, 1);
let five_hundred = x.0;
let six_point_four = x.1;
let one = x.2;
```


不带任何值的元组有个特殊的名称，叫做 **单元（unit）** 元组。这种值以及对应的类型都写作 `()`，表示空值或空的返回类型。如果表达式不返回任何其他值，则会隐式返回单元值。

**数组类型**

与元组不同，数组中的每个元素的类型必须相同。

Rust 中的数组长度是固定的。

`let a = [1, 2, 3, 4, 5];`

当你想要在栈（stack）而不是在堆（heap）上为数据分配空间，或者是想要确保总是有固定数量的元素时，数组非常有用。

数组不如 vector 类型灵活。vector 类型是标准库提供的一个 **允许** 增长和缩小长度的类似数组的集合类型。当不确定是应该使用数组还是 vector 的时候，那么很可能应该使用 vector。

`let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];`

编写数组的类型：在方括号中包含每个元素的类型，后跟分号，再后跟数组元素的数量。

```rust
let a: [i32;
5] = [1, 2, 3, 4, 5];
```


**访问数组元素**

数组是可以在栈 (stack) 上分配的已知固定大小的单个内存块。

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
    let first = a[0];
    let second = a[1];
}
```


**无效的数组元素访问**

程序在索引操作中使用一个无效的值时导致 **运行时** 错误。程序带着错误信息退出。

当尝试用索引访问一个元素时，Rust 会检查指定的索引是否小于数组的长度。

如果索引超出了数组长度，Rust 会 *panic*。

这种检查必须在运行时进行，特别是在这种情况下，因为编译器不可能知道用户在以后运行代码时将输入什么值。

##　函数

`fn` 关键字，它用来声明新函数。

Rust 代码中的函数和变量名使用 *snake case* 规范风格。在 snake case 中，所有字母都是小写并使用下划线分隔单词。

```rust
fn main() {
    println!("Hello, world!");
    another_function();
}

fn another_function() {
    println!("Another function.");
}
```


源码中 `another_function` 定义在 `main` 函数 **之后**；也可以定义在之前。Rust 不关心函数定义所在的位置，只要函数被调用时出现在调用之处可见的作用域内就行。

**参数**

```rust
fn main() {
    another_function(5);
}

fn another_function(x: i32) {
    println!("The value of x is: {x}");
}
```
在函数签名中，**必须**
声明每个参数的类型。
```rust
fn print_labeled_measurement(value: i32, unit_label: char) {
    println!("The measurement is: {value}{unit_label}");
}
```


### **语句与表达式**

函数体由一系列的语句和一个可选的结尾表达式构成。

Rust 是一门基于表达式（expression-based）的语言。

* **语句**（*Statements*）是执行一些操作但不返回值的指令。
* **表达式**（*Expressions*）计算并产生一个值。

函数定义也是语句，**调用**函数并不是语句。

```rust
let x = (let y = 6); // 报错，let y = 6 是语句而不是表达式

let y = {
    let x = 3;
    x + 1
}; // 不报错，是语句，因为 x + 1 后面没有加分号;
```


**具有返回值的函数**

不对返回值命名，但要在箭头（`->`）后声明它的类型。

在 Rust 中，函数的返回值等同于函数体最后一个表达式的值。

使用 `return` 关键字和指定值，可从函数中提前返回；但大部分函数隐式的返回最后的表达式。

```rust
fn five() -> i32 {
    5
} // 返回 5

fn five() -> i32 {
    5;
} // 报错，因为有分号; 不是表达式
```


## 注释

用`//` 会无视该行其后面的内容。

使用 `///` 可以使用markdown语法。

## 控制流

### **if - else if - else**

`if`关键字后面条件**必须**是 `bool` 值。如果条件不是 `bool` 值，我们将得到一个错误。

在`let`中使用：`let number = if 3 > 2 { 5 } else { 6 };`

当然，和 `? :`三目运算符一样，必须类型一样。

而且，`if`语句必须都返回一样的类型。

比如：

```rust
if 3 > 2 {
    5  // 返回i32
} else {
    6; // 返回()
} // 错误，返回类型不一致。
```


### **loop、while、for**

**loop**

无限循环，除非`break`

**从循环返回值**

在用于停止循环的 `break` 表达式后添加你希望返回的值；

```rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("The result is {result}");
}
```


**循环标签：跳出多层循环**

如果存在嵌套循环，`break` 和 `continue` 应用于此时最内层的循环。你可以选择在一个循环上指定一个 **循环标签**（*loop label*），然后将标签与 `break` 或 `continue` 一起使用，使这些关键字应用于已标记的循环而不是最内层的循环。

```rust
fn main() {
    let mut count = 0;
    'counting_up: loop {
        println!("count = {count}");
        let mut remaining = 10;

        loop {
            println!("remaining = {remaining}");
            if remaining == 9 {
                break;
            }
            if count == 2 {
                break 'counting_up;
            }
            remaining -= 1;
        }

        count += 1;
    }
    println!("End count = {count}");
}
```


**即使有标签也可以在标签后面添加返回值。**

如：`break ‘counting_up 123;`

**while**

与`loop`差不多。

**for 遍历**

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];

    for element in a {
        println!("the value is: {element}");
    }
}
```
或者使用
```rust
for i in 0..4 {
    // ...
}

for i in (0..4).rev() { // 从 3 到 0
    // ...
}
```


# 所有权

**所有权**（*ownership*）是 Rust 用于如何管理内存的一组规则。

Rust 则选择了第三种方式：通过所有权系统管理内存，编译器在编译时会根据一系列的规则进行检查。如果违反了任何这些规则，程序都不能编译。在运行时，所有权系统的任何功能都不会减慢程序的运行。

## 栈与堆

跟踪哪部分代码正在使用堆上的哪些数据，最大限度的减少堆上的重复数据的数量，以及清理堆上不再使用的数据确保不会耗尽空间，这些问题正是所有权系统要处理的。一旦理解了所有权，你就不需要经常考虑栈和堆了，不过明白了所有权的主要目的就是管理堆数据，能够帮助解释为什么所有权要以这种方式工作。

## 所有权规则

1. Rust 中的每一个值都有一个 **所有者**（*owner*）。
2. 值在任一时刻有且只有一个所有者。
3. 当所有者离开作用域，这个值将被丢弃。

**变量作用域**

```rust
{                      // s 在这里无效，它尚未声明
    let s = "hello";  // 从此处起，s 是有效的
    // 使用 s
}                      // 此作用域已结束，s 不再有效
```


**String 类型**

`String`类型管理被分配到堆上的数据，所以能够存储在编译时未知大小的文本。可以使用 `from` 函数基于字符串字面值来创建 `String`。

```rust
let mut s = String::from("hello");
s.push_str(", world!"); // push_str() 在字符串后追加字面值
println!("{s}"); // 将打印 `hello, world!`
```


`String` 可变而字面值却不行

**内存与分配**

Rust 采取了一个不同的策略：内存在拥有它的变量离开作用域后就被自动释放。

当变量离开作用域，Rust 为我们调用一个特殊的函数。这个函数叫做 [`drop`](https://doc.rust-lang.org/std/ops/trait.Drop.html#tymethod.drop)可以放置释放内存的代码。Rust 在结尾的 `}` 处自动调用 `drop`。类似于`RAII`

**移动的变量与数据交互**

在 Rust 中，多个变量可以采取不同的方式与同一数据进行交互。

```rust
let x = 5;
let y = x;
let s1 = String::from("hello");
let s2 = s1;
```


![image-20250518203127261](/img/rust%E5%AD%A6%E4%B9%A0/image-20250518203127261.webp)

当我们将 `s1` 赋值给 `s2`，`String` 的数据被复制了，这意味着我们从栈上拷贝了它的指针、长度和容量。我们并没有复制指针指向的堆上数据。

这就有了一个问题：当 `s2` 和 `s1` 离开作用域，它们都会尝试释放相同的内存。这是一个叫做 **二次释放**（*double free*）的错误。

为了确保内存安全，在 `let s2 = s1;` 之后，Rust 认为 `s1` 不再有效，因此 Rust 不需要在 `s1` 离开作用域后清理任何东西。

```rust
let s1 = String::from("hello");
let s2 = s1;
println!("{s1} {s2}"); // 报错，s1被move到s2，s1失效。
```


这里还隐含了一个设计选择：Rust 永远也不会自动创建数据的 “深拷贝”。因此，任何**自动**的复制都可以被认为是对运行时性能影响较小的。

**作用域与赋值**

作用域、所有权和通过 `drop` 函数释放内存之间的关系反过来也同样成立。

当你给一个已有的变量赋一个全新的值时，Rust 将会立即调用 `drop` 并释放原始值的内存。

```rust
let mut s = String::from("hello");
s = String::from("ahoy");
println!("{s}, world!");
```


**使用克隆的变量与数据交互**

如果我们 **确实** 需要深度复制 `String` 中堆上的数据，而不仅仅是栈上的数据，可以使用一个叫做 `clone` 的常用方法。

```rust
let s1 = String::from("hello");
let s2 = s1.clone();
```
**只在数据上的数据：拷贝**
```rust
let x = 5;
let y = x;
println!("x = {x}, y = {y}");
```


原因是像整型这样的在编译时已知大小的类型被整个存储在栈上，所以拷贝其实际的值是快速的。这意味着没有理由在创建变量 `y` 后使 `x` 无效。换句话说，这里没有深浅拷贝的区别，所以这里调用 `clone` 并不会与通常的浅拷贝有什么不同，我们可以不用管它。

Rust 有一个叫做 `Copy` trait 的特殊注解，可以用在类似整型这样的存储在栈上的类型。如果一个类型实现了 `Copy` trait，那么一个旧的变量在将其赋值给其他变量后仍然有效。

Rust 不允许自身或其任何部分实现了 `Drop` trait 的类型使用 `Copy` trait。如果我们对其值离开作用域时需要特殊处理的类型使用 `Copy` 注解，将会出现一个编译时错误。要学习如何为你的类型添加 `Copy` 注解以实现该 trait，请阅读附录 C 中的 [“可派生的 trait”](https://kaisery.github.io/trpl-zh-cn/appendix-03-derivable-traits.html)。

作为一个通用的规则，任何一组简单标量值的组合都可以实现 `Copy`，任何不需要分配内存或某种形式资源的类型都可以实现 `Copy` 。如下是一些 `Copy` 的类型：

* 所有整数类型，比如 `u32`。
* 布尔类型，`bool`，它的值是 `true` 和 `false`。
* 所有浮点数类型，比如 `f64`。
* 字符类型，`char`。
* 元组，当且仅当其包含的类型也都实现 `Copy` 的时候。比如，`(i32, i32)` 实现了 `Copy`，但 `(i32, String)` 就没有。

**所有权和函数**

将值传递给函数与给变量赋值的原理相似。向函数传递值可能会移动或者复制，就像赋值语句一样。

```rust
fn main() {
    let s = String::from("hello");  // s 进入作用域

    takes_ownership(s);             // s 的值移动到函数里 ...
                                    // ... 所以到这里不再有效

    let x = 5;                      // x 进入作用域

    makes_copy(x);                  // x 应该移动函数里，
                                    // 但 i32 是 Copy 的，
    println!("{}", x);              // 所以在后面可继续使用 x
} // 这里，x 先移出了作用域，然后是 s。但因为 s 的值已被移走，
  // 没有特殊之处

fn takes_ownership(some_string: String) { // some_string 进入作用域
    println!("{some_string}");
} // 这里，some_string 移出作用域并调用 `drop` 方法。
  // 占用的内存被释放

fn makes_copy(some_integer: i32) { // some_integer 进入作用域
    println!("{some_integer}");
} // 这里，some_integer 移出作用域。没有特殊之处
```


**返回值与作用域**

返回值也可以转移所有权。

```rust
fn main() {
    let s1 = gives_ownership();        // gives_ownership moves its return
                                       // value into s1

    let s2 = String::from("hello");    // s2 comes into scope

    let s3 = takes_and_gives_back(s2); // s2 is moved into
                                       // takes_and_gives_back, which also
                                       // moves its return value into s3
} // Here, s3 goes out of scope and is dropped. s2 was moved, so nothing
  // happens. s1 goes out of scope and is dropped.

fn gives_ownership() -> String {       // gives_ownership will move its
                                       // return value into the function
                                       // that calls it
    let some_string = String::from("yours"); // some_string comes into scope
    some_string                        // some_string is returned and
                                       // moves out to the calling
                                       // function
}

// 该函数将传入字符串并返回该值
fn takes_and_gives_back(a_string: String) -> String {
    // a_string comes into scope
    a_string  // 返回 a_string 并移出给调用的函数
}
```


变量的所有权总是遵循相同的模式：将值赋给另一个变量时它会移动。当持有堆中数据值的变量离开作用域时，其值将通过 `drop` 被清理掉，除非数据被移动为另一个变量所有。

为了不转移所有权就使用变量，Rust 对此提供了一个不用获取所有权就可以使用值的功能，叫做 **引用**（*references*）。

## 引用与借用

**引用**（*reference*）像一个指针，因为它是一个地址，我们可以由此访问储存于该地址的属于其他变量的数据。与指针不同，引用在其生命周期内保证指向某个特定类型的有效值。

引用：`&`

```rust
fn calculate_length(s: &String) -> usize { // s 是 String 的引用
    s.len()
} // 这里，s 离开了作用域。但因为它并不拥有引用值的所有权，
  // 所以什么也不会发生
```


创建一个引用的行为称为 **借用**（*borrowing*）。

借用结束之后，必须还回去。因为我们并不拥有它的所有权。

同时，借用不允许修改。

**可变引用**

使用 `mut` 即可修改借用值，即可变引用。

```rust
fn main() {
    let mut s = String::from("hello");
    change(&mut s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```


可变引用有一个很大的限制：如果你有一个对该变量的可变引用，你就不能再创建对该变量的引用。这些尝试创建两个 `s` 的可变引用的代码会失败。（kora，这不还是独占嘛）

防止同一时间对同一数据存在多个可变引用。

好处是 Rust 可以在编译时就避免数据竞争。**数据竞争**（*data race*）类似于竞态条件，它可由这三个行为造成：

* 两个或更多指针同时访问同一数据。
* 至少有一个指针被用来写入数据。
* 没有同步数据访问的机制。

注意一个引用的作用域从声明的地方开始一直持续到**最后一次使用**为止，而不是持续到作用域结束。

```rust
let mut s = String::from("hello");

let r1 = &s; // 没问题
let r2 = &s; // 没问题
println!("{r1} and {r2}"); // 此位置之后 r1 和 r2 不再使用

let r3 = &mut s; // 没问题
println!("{r3}");
```


**悬垂引用（Dangling References）**

在具有指针的语言中，很容易通过释放内存时保留指向它的指针而错误地生成一个**悬垂指针**（*dangling pointer*）—— 指向可能已被分配给其他用途的内存位置的指针。

相比之下，在 Rust 中编译器确保引用永远也不会变成悬垂引用：当你拥有一些数据的引用，编译器确保数据不会在其引用之前离开作用域。

```rust
fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String {
    let s = String::from("hello");
    &s
} // 报错，显然，s 的生命周期结束了。
```
正确的方法：
```rust
fn no_dangle() -> String {
    let s = String::from("hello");
    s
}
```


**引用的规则**

让我们概括一下之前对引用的讨论：

* 在任意给定时间，**要么**只能有一个可变引用，**要么**只能有多个不可变引用。
* 引用必须总是有效的。

## Slice 类型

slice 是一种引用，不拥有所有权。

考虑题目：写一个函数，该函数接收一个用空格分隔单词的字符串，并返回在该字符串中找到的第一个单词。如果函数在该字符串中并未找到空格，则整个字符串就是一个单词，所以应该返回整个字符串。

```rust
fn first_word(s: &String) -> usize {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return i;
        }
    }

    s.len()
}
```


这是一个返回单词结尾的索引的函数。

但这不太方便。于是有了切片：

`[starting_index..ending_index]`指定范围，相当于 `[first, last]`

```rust
let s = String::from("hello world");

let hello = &s[0..5];
let world = &s[6..11];
```


对于 Rust 的 `..` range 语法，如果想要从索引 0 开始，可以不写两个点号之前的值。

如果 slice 包含最后一个，也可以舍弃尾部的数字。

```rust
let s = String::from("hello");

let slice = &s[0..2];
let slice = &s[..2];

let len = s.len();

let slice = &s[0..len];
let slice = &s[..];
```


**注意：字符串 slice range 的索引必须位于有效的 UTF-8 字符边界内，如果尝试从一个多字节字符的中间位置创建字符串 slice，则程序将会因错误而退出。**

`String`切片的类型为：`&str`

`[Type;Length]`的切片类型为：`&[Type]`

在这种情况下，为了保证引用有效：

```rust
fn main() {
    let mut s = String::from("hello world");

    let word = first_word(&s);

    s.clear(); // 错误！

    println!("the first word is: {word}");
}
```


当拥有某值的不可变引用时，就不能再获取一个可变引用。

因为 `clear(&mut self)` 需要清空 `String`，它尝试获取一个可变引用。

在调用 `clear` 之后的 `println!` 使用了 `word` 中的引用，所以这个不可变的引用在此时必须仍然有效。

Rust 不允许 `clear` 中的可变引用和 `word` 中的不可变引用同时存在，因此编译失败。

Rust 不仅使得我们的 API 简单易用，也在编译时就消除了一整类的错误！

**字符串字面值就是 slice**

这也是为什么字面量不可变的原因，因为她是不可变引用。

**字符串 slice 作为参数**

比起：`fn first_word(s: &String) -> &str`

用：`fn first_word(s: &str) -> &str` 更好

如果有一个字符串 slice，可以直接传递它。如果有一个 `String`，则可以传递整个 `String` 的 slice 或对 `String` 的引用。

**其他类型的 slice**

字符串 slice，正如你想象的那样，是针对字符串的。不过也有更通用的 slice 类型。考虑一下这个数组：

```rust
let
a
=
[1,
2,
3,
4,
5];
```
就跟我们想要获取字符串的一部分那样，我们也会想要引用数组的一部分。我们可以这样做：
```rust
let a = [1, 2, 3, 4, 5];
let slice = &a[1..3];
assert_eq!(slice, &[2, 3]);
```


这个 slice 的类型是 `&[i32]`。它跟字符串 slice 的工作方式一样，通过存储第一个集合元素的引用和一个集合总长度。

## 结构体

结构体与声明使用：

```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}

fn main() {
    let mut user1 = User {
        active: true,
        username: String::from("someusername123"),
        email: String::from("someone@example.com"),
        sign_in_count: 1,
    };
    user1.email = String::from("anotheremail@example.com");
}
```


注意整个实例必须是可变的；Rust 并不允许只将某个字段标记为可变。

可以在函数体的最后一个表达式中构造一个结构体的新实例，来隐式地返回这个实例。

字段初始化简化：

```rust
fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username: username,
        email: email,
        sign_in_count: 1,
    }
}

// -> 只有当当前作用域存在于 field 名字相同的变量才可以这样做，而且要求类型一致。
fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username,
        email,
        sign_in_count: 1,
    }
}
```
**从其他实例创建实例**
```rust
fn main() {
    let user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };

    let user2 = User {
        active: user1.active,
        username: user1.username,
        email: String::from("another@example.com"),
        sign_in_count: user1.sign_in_count,
    };

    let user2 = User {
        email: String::from("another@example.com"),
        ..user1 // 用..来省略余下，要求必须放在最后。
    };
}
```

但是结构更新语法就像带有 `=` 的赋值，因为它移动了数据，至于克隆，则也是一样的。

**使用没有命名字段的元组结构体来创建不同的类型**

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
    let Color(x, y, z) = black; // 与元组不同，必须指明类型，才能解构。
}
```


**没有任何字段的类单元结构体**

称为 **类单元结构体**（*unit-like structs*）因为它们类似于 `()`

常常在你想要在某个类型上实现 trait 但不需要在类型中存储数据的时候发挥作用。

如：

```rust
struct AlwaysEqual;

fn main() {
    let subject = AlwaysEqual;
}
```


设想我们稍后将为这个类型实现某种行为，使得每个 `AlwaysEqual` 的实例始终等于任何其它类型的实例，也许是为了获得一个已知的结果以便进行测试。

**结构体数据的所有权**

可以使结构体存储被其他对象拥有的数据的引用，不过这么做的话需要用上 **生命周期**（*lifetimes*），这是一个第十章会讨论的 Rust 特性。生命周期确保结构体引用的数据有效性跟结构体本身保持一致。

## 简单Debug

结构体派生`trait`

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {}", rect1);
}
```
报错：
```cpp
error[E0277]: `Rectangle` doesn't implement `std::fmt::Display`
 = help: the trait `std::fmt::Display` is not implemented for `Rectangle`
 = note: in format strings you may be able to use `{:?}` (or {:#?} for pretty-print) instead
```


`{}` 默认告诉 `println!` 使用被称为 `Display` 的格式，没有实现`Disyplay`的结构体，将不予输出。

但即使输出方式为：

```
println!("rect1 is {:?}", rect1);
```
仍然报错：
```rust
error[E0277]: `Rectangle` doesn't implement `Debug`
 = help: the trait `Debug` is not implemented for `Rectangle`
 = note: add `#[derive(Debug)]` to `Rectangle` or manually `impl Debug for Rectangle`
```


正确方式（使用`Debug` trait）：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {rect1:?}");
    // 或者
    dbg!(&rect1);
}
```


或者使用`dbg!`宏。

区别在于`dbg!`打印到`stderr`，`println!`打印到`stderr`

# 方法

**方法**（method）与函数类似：它们使用 `fn` 关键字和名称声明，可以拥有参数和返回值，同时包含在某处调用该方法时会执行的代码。不过方法与函数是不同的，因为它们在结构体的上下文中被定义（或者是枚举或 trait 对象的上下文），并且它们第一个参数总是 `self`，它代表调用该方法的结构体实例。

如：

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
}
```


为了使函数定义于 `Rectangle` 的上下文中，我们开始了一个 `impl` 块（`impl` 是 *implementation* 的缩写），这个 `impl` 块中的所有内容都将与 `Rectangle` 类型相关联。

方法的第一个参数必须有一个名为 `self` 的`Self` 类型的参数，否则不会把方法绑定到类型上，**仅仅是作用域的一个函数而已。**

所以 Rust 让你在第一个参数位置上可以只用 `self` 这个名字来简化。

注意，我们仍然需要在 `self` 前面使用 `&` 来表示这个方法借用了 `Self` 实例，就像我们在 `rectangle: &Rectangle` 中做的那样。

**同时`Self`仅仅表示类型而已，如果把函数绑定成方法，唯一要做的只是第一个参数名字叫`self`而已，同时类型一致。在C++中类似于在每个类中 using Self = type;**

方法可以选择获得 `self` 的所有权，或者像我们这里一样不可变地借用 `self`，或者可变地借用 `self`，就跟其他参数一样。

方法也是函数，只是绑定到了类型上同时第一个参数为`self`而已，可以通过：

```
Rectangle::area
(&rect1);
```


来调用对应方法/函数。

Rust 并没有一个与 `->` 等效的运算符；相反，Rust 有一个叫 **自动引用和解引用**（*automatic referencing and dereferencing*）的功能。方法调用是 Rust 中少数几个拥有这种行为的地方。

**关联函数**

所有在 `impl` 块中定义的函数被称为 **关联函数**（*associated functions*），因为它们与 `impl` 后面命名的类型相关。我们可以定义不以 `self` 为第一参数的关联函数（因此不是方法），因为它们并不作用于一个结构体的实例。

不是方法的关联函数经常被用作返回一个结构体新实例的构造函数。这些函数的名称通常为 `new` ，但 `new` 并不是一个关键字。这样可以更轻松的创建对象。

**多个 impl 块**

每个结构体都允许有多个 `impl`块。

## 枚举与模式匹配

**定义**

如：

```rust
enum IpAddrKind {
    V4,
    V6,
}
```
**枚举值**
```rust
let four = IpAddrKind::V4;
let six: IpAddrKind = IpAddrKind::V6;
```


枚举变成了某个类型，而不是一个值。

可以使用一种更简洁的方式来表达相同的概念，仅仅使用枚举并将数据直接放进每一个枚举成员而不是将枚举作为结构体的一部分。`IpAddr` 枚举的新定义表明了 `V4` 和 `V6` 成员都关联了 `String` 值：

```rust
enum IpAddr {
    V4(String),
    V6(String),
}

let home = IpAddr::V4(String::from("127.0.0.1"));
let loopback = IpAddr::V6(String::from("::1"));
```
用枚举替代结构体还有另一个优势：每个成员可以处理不同类型和数量的数据。
```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

let home = IpAddr::V4(127, 0, 0, 1);
let loopback = IpAddr::V6(String::from("::1"));
```


更像是存储了类型信息的`union`共用体。

一个枚举的例子：

```rust
struct Ipv4Addr {
    // --snip--
}

struct Ipv6Addr {
    // --snip--
}

enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}
```


使用枚举类型，可以定义一个能够处理这些不同类型的结构体的函数，因为枚举是单独一个类型。

结构体和枚举还有另一个相似点：就像可以使用 `impl` 来为结构体定义方法那样，也可以在枚举上定义方法。

**Option 枚举以及优势**

Rust 没有**空值(null)**。

我觉得空与不空是把，数据的状态和数据的值耦合在了一起。

但这种概念本身是没有错误的，错误的是具体实现。

Rust 用 Option 来解决这个问题。

```rust
enum Option<T> {
    None,
    Some(T),
}
```


因为 `Option<T>` 和 `T`（这里 `T` 可以是任何类型）是不同的类型，编译器不允许像一个肯定有效的值那样使用 `Option<T>`。这是`Option`优于`null`的地方。

```rust
let x: i8 = 5;
let y: Option<i8> = Some(5);
let sum = x + y; // 报错。
```


换句话说，在对 `Option<T>` 进行运算之前必须将其转换为 `T`。

通常这能帮助我们捕获到空值最常见的问题之一：假设某值不为空但实际上为空的情况。

也就是说，`Option<T>`要求程序员必须考虑值是否为空。

# match 控制流

Rust 有一个叫做 `match` 的极为强大的控制流运算符，它允许我们将一个值与一系列的模式相比较，并根据相匹配的模式执行相应代码。

模式可由字面值、变量、通配符和许多其他内容构成；

值通过 `match` 的每一个模式，并且在遇到第一个 “符合” 的模式时，值会进入相关联的代码块并在执行中被使用。

```rust
enum State {
    A,
    B,
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(State),
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
    }
}
```


这看起来非常像 `if` 所使用的条件表达式，不过这里有一个非常大的区别：对于 `if`，表达式必须返回一个布尔值，而这里它可以是任何类型的。

`match` 的分支:

一个分支有两个部分：一个模式和一些代码。

第一个分支的模式是值 `Coin::Penny` 而之后的 `=>` 运算符将模式和将要运行的代码分开。这里的代码就仅仅是值 `1`。每一个分支之间使用逗号分隔。

当 `match` 表达式执行时，它将结果值按顺序与每一个分支的模式相比较。如果模式匹配了这个值，这个模式相关联的代码将被执行。

当然每个分支也可以是大括号。

```rust
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => {
            println!("Lucky penny!");
            1
        }
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```
也可以绑定对应的值。
```rust
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {state:?}!");
            25
        }
    }
}
```
**匹配
Option**
```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```
**match
匹配是穷尽的**
```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        Some(i) => Some(i + 1),
    } // 不可编译
}
```
**通用匹配和占位符**
```rust
let dice_roll = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    other => move_player(other), // 这里获取了剩下的所有情况，同时可以使用other来处理
}

fn add_fancy_hat() {}
fn remove_fancy_hat() {}
fn move_player(num_spaces: u8) {}
```


当我们不想使用通配模式获取的值时，请使用 `_` ，这是一个特殊的模式，可以匹配任意值而不绑定到该值。

```rust
let dice_roll = 9;
match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    _ => reroll(), // 对于值不关心。
}

fn add_fancy_hat() {}
fn remove_fancy_hat() {}
fn reroll() {}
```


**if-let 控制流**

`if let` 语法让我们以一种不那么冗长的方式结合 `if` 和 `let`，来处理只匹配一个模式的值而忽略其他模式的情况。

```rust
let config_max = Some(3u8);
if let Some(max) = config_max {
    println!("The maximum is configured to be {max}");
}
```


这样可以不使用`match`而仅仅匹配一个情况，剩下的情况并不关心。

可以认为 `if let` 是 `match` 的一个语法糖，它当值匹配某一模式时执行代码而忽略所有其他值。

# Rust std 集合

## Vector<T>

**新建**

```rust
let
v:
Vec<i32>
=
Vec::new
();
```


增加了一个类型注解。因为没有向这个 vector 中插入任何值，Rust 并不知道我们想要储存什么类型的元素。

或者：

使用`vec!`宏，可以推断给定值创建一个`vector`

```rust
let
v
=
vec![1,
2,
3];
```
**更新**
```rust
let
mut
v
=
Vec::new
();
//
错误Rust推断不出类型
```
正确：
```rust
let mut v = Vec::new();
v.push(5); // 通过这句话，Rust推断出类型。
```
**读取**
```rust
let v = vec![1, 2, 3, 4, 5];

let third: &i32 = &v[2];
println!("The third element is {third}");

let third: Option<&i32> = v.get(2);
match third {
    Some(third) => println!("The third element is {third}"),
    None => println!("There is no third element."),
}
```


有两种方法引用 vector 中储存的值：通过索引或使用 `get` 方法。

Rust 提供了两种引用元素的方法的原因是当尝试使用现有元素范围之外的索引值时可以选择让程序如何运行。

```rust
let v = vec![1, 2, 3, 4, 5];
let does_not_exist = &v[100]; // panic
let does_not_exist = v.get(100); // None
```


一旦程序获取了一个有效的引用，借用检查器将会执行所有权和借用规则来确保 vector 内容的这个引用和任何其他引用保持有效。

回忆一下不能在相同作用域中同时存在可变和不可变引用的规则。

```rust
let mut v = vec![1, 2, 3, 4, 5];
let first = &v[0]; // 获取一个借用
v.push(6); // error. 获取一个引用。
println!("The first element is: {first}");
```
**遍历**
```rust
let v = vec![100, 32, 57];
for i in &v {
    println!("{i}");
}
```
也可以遍历可变
vector
的每一个元素的可变引用以便能改变它们。
```rust
let mut v = vec![100, 32, 57];
for i in &mut v {
    *i += 50;
}
```


因为借用检查器的规则，无论可变还是不可变地遍历一个 vector 都是安全的。

**枚举存储多种类型**

vector 只能储存相同类型的值。这是很不方便的；绝对会有需要储存一系列不同类型的值的用例。

如：

```rust
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}

let row = vec![
    SpreadsheetCell::Int(3),
    SpreadsheetCell::Text(String::from("blue")),
    SpreadsheetCell::Float(10.12),
]; // 之后再遍历的时候可以使用 match 来枚举。
```


**丢弃 vector 时也会丢弃其所有元素**

## String 与 UTF-8

Rust 的核心语言中只有一种字符串类型：字符串 slice `str`，它通常以被借用的形式出现，`&str`。

**String**

字符串（`String`）类型由 Rust 标准库提供，而不是编入核心语言，它是一种可增长、可变、可拥有、UTF-8 编码的字符串类型。

**新建字符串**

```rust
let mut s = String::new();
let data = "initial contents";
let s = data.to_string();

// 该方法也可直接用于字符串字面值：
let s = "initial contents".to_string();

// 字面量创建 String。
let s = String::from("initial contents");
```


字符串是 UTF-8 编码的。

**更新**

`String` 的大小可以增加，其内容也可以改变，就像可以放入更多数据来改变 `Vec` 的内容一样。

另外，可以方便的使用 `+` 运算符或 `format!` 宏来拼接 `String` 值。

```rust
// push_str 字面量
let mut s = String::from("foo");
s.push_str("bar");

// push 字符
s.push('c');

// push_str String
let mut s1 = String::from("foo");
let s2 = "bar";
s1.push_str(s2);
println!("s2 is {s2}");
```
**+
运算符和
format!
宏**
```rust
let s1 = String::from("Hello, ");
let s2 = String::from("world!");
let s3 = s1 + &s2; // 注意 s1 被移动了，不能继续使用
```


因为`add`的签名： `add(self, s: &str) -> String`

所以`self`被移动了，而且`&String`可以被强制转化为`&str`

**强转**（*coerced*） **Deref 强制转换**（*deref coercion*）

```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

let s = s1 + "-" + &s2 + "-" + &s3;
```


不过这样就显得非常麻烦了，更适合：

`s = s + &other_string`这样效率更好，同时语义易于理解。

或者使用`println!`宏

```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

let s = format!("{s1}-{s2}-{s3}");
```


这个地方全`copy`，`s1,s2,s3`是没有被移动的。

**索引字符串**

```rust
let s1 = String::from("hi");
let h = s1[0]; // 错误，Rust 的字符串不支持索引。
```


**String 内部表示**

`String` 是一个 `Vec<u8>` 的封装。

```rust
let
hello
=
String::from
("Здравствуйте");
```


当问及这个字符是多长的时候有人可能会说是 12。然而，Rust 的回答是 24。

这是使用 UTF-8 编码 “Здравствуйте” 所需要的字节数，这是因为每个 Unicode 标量值需要两个字节存储。

因此一个字符串字节值的索引并不总是对应一个有效的 Unicode 标量值。

如下无效的 Rust 代码：

```rust
let hello = "Здравствуйте";
let answer = &hello[0]; // 拒绝索引。
```


**字节、标量值和字形簇**

从 Rust 的角度来讲，事实上有三种相关方式可以理解字符串：字节、标量值和字形簇（最接近人们眼中 **字母** 的概念）。

最后一个 Rust 不允许使用索引获取 `String` 字符的原因是，索引操作预期总是需要常数时间（O(1)）。但是对于 `String` 不可能保证这样的性能，因为 Rust 必须从开头到索引位置遍历来确定有多少有效的字符。

**字符串 slice**

相比使用 `[]` 和单个值的索引，可以使用 `[]` 和一个 range 来创建含特定字节的字符串 slice：

```rust
let hello = "Здравствуйте";
let s = &hello[0..4];
```


但是如果：`&hello[0..1]`，Rust会在运行时panic。

和无效索引一样。

**遍历字符串的方法**

操作字符串每一部分的最好的方法是明确表示需要字符还是字节。

对于单独的 Unicode 标量值使用 `chars` 方法。

```
for c in "Зд".chars() {     println!("{c}");
} // 输出： // З // д
```


对于获取原始字节，使用`bytes`方法

```
for b in "Зд".bytes() {     println!("{b}");
} // 输出： // 208 // 151 // 208 // 180
```


有效的 Unicode 标量值可能会由不止一个字节组成。

不同的语言选择了不同的向程序员展示其复杂性的方式。Rust 选择了以准确的方式处理 `String` 数据作为所有 Rust 程序的默认行为，这意味着程序员们必须更多的思考如何预先处理 UTF-8 数据。

## Hash Map

`HashMap<K, V>` 类型储存了一个键类型 `K` 对应一个值类型 `V` 的映射。

它通过一个 **哈希函数**（*hashing function*）来实现映射，决定如何将键和值放入内存中。

**新建**

可以使用 `new` 创建一个空的 `HashMap`，并使用 `insert` 增加元素。

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
```


**访问**

通过 `get` 方法并提供对应的键来从哈希 map 中获取值

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score = scores.get(&team_name).copied().unwrap_or(0);
```


`get` 方法返回 `Option<&V>`，如果某个键在哈希 map 中没有对应的值，`get` 会返回 `None`。程序中通过调用 `copied` 方法来获取一个 `Option<i32>` 而不是 `Option<&i32>`，接着调用 `unwrap_or` 在 `scores` 中没有该键所对应的项时将其设置为零。

**遍历**

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{key}: {value}");
}
```


会以任意顺序打印出每一个键值对。

顺序可能会每次都不同。

**哈希 map 与所有权**

对于像 `i32` 这样的实现了 `Copy` trait 的类型，其值可以拷贝进哈希 map。

对于像 `String` 这样拥有所有权的值，其值将被移动而哈希 map 会成为这些值的所有者。

```rust
use std::collections::HashMap;

let field_name = String::from("Favorite color");
let field_value = String::from("Blue");

let mut map = HashMap::new();
map.insert(field_name, field_value);
// 这里 field_name 和 field_value 不再有效，
// 尝试使用它们看看会出现什么编译错误！
```


如果将值的引用插入哈希 map，这些值本身将不会被移动进哈希 map。

但是这些引用指向的值必须至少在哈希 map 有效时也是有效的。

**更新**

当我们想要改变哈希 map 中的数据时，必须决定如何处理一个键已经有值了的情况。

可以选择完全无视旧值并用新值代替旧值。

可以选择保留旧值而忽略新值，并只在键 **没有** 对应值时增加新值。

可以结合新旧两值。

覆盖：insert

```rust
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25); // 结果为 25
```


用 insert 插入会覆盖。

忽略新值：entry().or\_insert()

```rust
scores.entry(String::from("Yellow")).or_insert(50);
scores.entry(String::from("Blue")).or_insert(50);
```


`Entry` 的 `or_insert` 方法在键对应的值存在时就返回这个值的可变引用，如果不存在则将参数作为新值插入并返回新值的可变引用。

这比编写自己的逻辑要简明的多，另外也与借用检查器结合得更好。

根据旧值更新：

```rust
// 下面代码用来统计 text 中的单词：
let text = "hello world wonderful world";
let mut map = HashMap::new();

// split_whitespace() 表示按照空格分隔 text 字符串并获取 slice。
for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}

println!("{map:?}");
```


**哈希函数**

`HashMap` 默认使用一种叫做 `SipHash` 的哈希函数，它可以抵御涉及哈希表的拒绝服务（Denial of Service, DoS）攻击。然而这并不是可用的最快的算法，不过为了更高的安全性值得付出一些性能的代价。

# 包、Cargo与crate

## 基本概念

* **包**（*Packages*）：Cargo 的一个功能，它允许你构建、测试和分享 crate。
* **Crates** ：一个模块的树形结构，它形成了库或可执行文件项目。
* **模块**（*Modules*）和 **use**：允许你控制作用域和路径的私有性。
* **路径**（*path*）：一个为例如结构体、函数或模块等项命名的方式。

crate 是 Rust 在编译时最小的代码单位。即使你用 `rustc` 而不是 `cargo` 来编译一个单独的源代码文件，编译器还是会将那个文件视为一个 crate。

crate 可以包含模块，模块可以定义在其他文件，然后和 crate 一起编译。

crate 有两种形式：二进制 crate 和库 crate。

**二进制 crate**（*Binary crates*）可以被编译为可执行程序，比如命令行程序或者服务端。它们必须有一个名为 `main` 函数来定义当程序被执行的时候所需要做的事情。

**库 crate**（*Library crates*）并没有 `main` 函数，它们也不会编译为可执行程序。相反它们定义了可供多个项目复用的功能模块。与其他语言的库 library 概念一致。

*crate root* 是一个源文件，Rust 编译器以它为起始点，并构成 crate 的根模块。

*包*（*package*）是提供一系列功能的一个或者多个 crate的捆绑。一个包会包含一个 *Cargo.toml* 文件，阐述如何去构建这些 crate。

Cargo 实际上就是一个包，它包含了用于构建你代码的命令行工具的二进制 crate。

其他项目也依赖 Cargo 库来实现与 Cargo 命令行程序一样的逻辑。

包中可以包含至多一个库 crate(library crate)。

包中可以包含任意多个二进制 crate(binary crate)，但是必须至少包含一个 crate（无论是库的还是二进制的）。

## 定义模块

模块、路径、`use`关键词和`pub`关键词如何在编译器中工作，以及大部分开发者如何组织他们的代码。

* **从 crate 根节点开始**: 当编译一个 crate, 编译器首先在 crate 根文件（通常，对于一个库 crate 而言是 *src/lib.rs*，对于一个二进制 crate 而言是 *src/main.rs*）中寻找需要被编译的代码。
* **声明模块**: 在 crate 根文件中，你可以声明一个新模块；比如，用 `mod garden;` 声明了一个叫做 `garden` 的模块。编译器会在下列路径中寻找模块代码：
  + 内联，用大括号替换 `mod garden` 后跟的分号
  + 在文件 *src/garden.rs*
  + 在文件 *src/garden/mod.rs*
* **声明子模块**: 在除了 crate 根节点以外的任何文件中，你可以定义子模块。比如，你可能在 *src/garden.rs* 中声明 `mod vegetables;`。编译器会在以父模块命名的目录中寻找子模块代码：
  + 内联，直接在 `mod vegetables` 后方不是一个分号而是一个大括号
  + 在文件 *src/garden/vegetables.rs*
  + 在文件 *src/garden/vegetables/mod.rs*

* **模块中的代码路径**: 一旦一个模块是你 crate 的一部分，你可以在隐私规则允许的前提下，从同一个 crate 内的任意地方，通过代码路径引用该模块的代码。举例而言，一个 garden vegetables 模块下的 `Asparagus` 类型可以通过 `crate::garden::vegetables::Asparagus` 访问。
* **私有 vs 公用**: 一个模块里的代码默认对其父模块私有。为了使一个模块公用，应当在声明时使用 `pub mod` 替代 `mod`。为了使一个公用模块内部的成员公用，应当在声明前使用`pub`。
* **`use` 关键字**: 在一个作用域内，`use`关键字创建了一个项的快捷方式，用来减少长路径的重复。在任何可以引用 `crate::garden::vegetables::Asparagus` 的作用域，你可以通过 `use crate::garden::vegetables::Asparagus;` 创建一个快捷方式，然后你就可以在作用域中只写 `Asparagus` 来使用该类型。

```
backyard
├── Cargo.lock
├── Cargo.toml
└── src
    ├── garden
    │   └── vegetables.rs
    ├── garden.rs
    └── main.rs
```


## 模块中对代码分组

*模块* 让我们可以将一个 crate 中的代码进行分组，以提高可读性与重用性。

因为一个模块中的代码默认是私有的，所以还可以利用模块控制项的 *私有性*。

私有项是不可为外部使用的内在详细实现。我们也可以将模块和它其中的项标记为公开的，这样，外部代码就可以使用并依赖于它们。

```rust
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn serve_order() {}

        fn take_payment() {}
    }
}
```


我们定义一个模块，是以 `mod` 关键字为起始，然后指定模块的名字（本例中叫做 `front_of_house`），并且用花括号包围模块的主体。

在模块内，我们还可以定义其他的模块，就像本例中的 `hosting` 和 `serving` 模块。

模块还可以保存一些定义的其他项，比如结构体、枚举、常量、特性、或者函数。

`src/main.rs` 和 `src/lib.rs` 叫做 crate 根。之所以这样叫它们是因为这两个文件的内容都分别在 crate 模块结构的根组成了一个名为 `crate` 的模块，该结构被称为 *模块树*（*module tree*）。

如：

```text
crate
└── front_of_house
    ├── hosting
    │   ├── add_to_waitlist
    │   └── seat_at_table
    └── serving
        ├── take_order
        ├── serve_order
        └── take_payment
```


## 引用模块的路径

为了调用一个函数，我们需要知道它的路径。

路径有两种形式：

* **绝对路径**（*absolute path*）是以 crate 根（root）开头的全路径；对于外部 crate 的代码，是以 crate 名开头的绝对路径，对于当前 crate 的代码，则以字面值 `crate` 开头。
* **相对路径**（*relative path*）从当前模块开始，以 `self`、`super` 或定义在当前模块中的标识符开头。

```rust
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
} // 不可编译！！！！因为hosting模块不是 pub 的。
```


父模块中的项不能使用子模块中的私有项，但是子模块中的项可以使用它们父模块中的项。

这是因为子模块封装并隐藏了它们的实现详情，但是子模块可以看到它们定义的上下文。

因为`eat_at_restaurant`和`front_of_house`定义在同一个模块下，所以可以访问`front_of_house`

```rust
mod front_of_house {
    pub mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
} // 不可编译！！！add_to_waitlist()不是pub的
```


在 `mod hosting` 前添加了 `pub` 关键字，使其变成公有的。伴随着这种变化，如果我们可以访问 `front_of_house`，那我们也可以访问 `hosting`。

但是 `hosting` 的 *内容*（*contents*）仍然是私有的；这表明使模块公有并不使其内容也是公有的。模块上的 `pub` 关键字只允许其父模块引用它，而不允许访问内部代码。

因为模块是一个容器，只是将模块变为公有能做的其实并不太多；同时需要更深入地选择将一个或多个项变为公有。

私有性规则不但应用于模块，还应用于结构体、枚举、函数和方法。

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
} // 正确！！。
```




```
二进制和库 crate 包的最佳实践：
我们提到过包（package）可以同时包含一个 `src/main.rs` 二进制 crate 根，
和一个 `src/lib.rs` 库 crate 根，并且这两个 crate 默认以包名来命名。

通常，这种同时包含二进制 crate 和库 crate 的包，
会在二进制 crate 中只保留足以生成可执行文件的代码，
并由可执行文件去调用库 crate 的代码。

又因为库 crate 可以共享，这使得其它项目也能从包提供的大部分功能中受益。
模块树应该定义在 `src/lib.rs` 中。
这样通过以包名开头的路径，公有项就可以在二进制 crate 中使用。

二进制 crate 也就和其它位于该 crate 之外、使用库 crate 的用户一样：
二者都只能使用公有 API。
```


## super 开始的相对路径

通过在路径的开头使用 `super` ，从父模块开始构建相对路径，而不是从当前模块或者 crate 根开始。这类似以 `..` 语法开始一个文件系统路径。

使用 `super` 允许我们引用父模块中的已知项，这使得重新组织模块树变得更容易 —— 当模块与父模块关联的很紧密，但某天父模块可能要移动到模块树的其它位置。

```rust
fn deliver_order() {}

mod back_of_house {
    fn fix_incorrect_order() {
        cook_order();
        super::deliver_order(); // 从上一级开始搜索。
    }

    fn cook_order() {}
}
```


## 创建公用结构体与枚举类型

如果我们在一个结构体定义的前面使用了 `pub` ，这个结构体会变成公有的，但是这个结构体的字段仍然是私有的。

我们可以根据情况决定每个字段是否公有。

```rust
mod back_of_house {
    pub struct Breakfast {
        pub toast: String,      // 字段可见。
        seasonal_fruit: String, // 字段不可见。
    }

    impl Breakfast {
        pub fn summer(toast: &str) -> Breakfast {
            Breakfast {
                toast: String::from(toast),
                seasonal_fruit: String::from("peaches"),
            }
        }
    }
}

pub fn eat_at_restaurant() {
    // 在夏天订购一个黑麦土司作为早餐
    let mut meal = back_of_house::Breakfast::summer("Rye");

    // 改变主意更换想要面包的类型
    meal.toast = String::from("Wheat");
    println!("I'd like {} toast please", meal.toast);

    // 如果取消下一行的注释代码不能编译；
    // 不允许查看或修改早餐附带的季节水果
    meal.seasonal_fruit = String::from("blueberries");
}
```


相反，如果我们将枚举设为公有，则它的所有成员都将变为公有。

只需要在 `enum` 关键字前面加上 `pub`

如果枚举成员不是公有的，那么枚举会显得用处不大；

给枚举的所有成员挨个添加 `pub` 是很令人恼火的，因此枚举成员默认就是公有的。

## use 引入作用域

在作用域中增加 `use` 和路径类似于在文件系统中创建软连接（符号连接，symbolic link）。

通过在 crate 根增加 `use crate::front_of_house::hosting`，现在 `hosting` 在作用域中就是有效的名称了，如同 `hosting` 模块被定义于 crate 根一样。

通过 `use` 引入作用域的路径也会检查私有性，同其它路径一样。

注意 `use` 只能创建 `use` 所在的特定作用域内的短路径。

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting;

mod customer {
    pub fn eat_at_restaurant() {
        hosting::add_to_waitlist();
    }
} // 不能编译，因为eat_at_restaurant()所在模块customer没有使用use。
// 需要把mod curtomer {} 删除。
```
##　创建惯用的
use
路径
```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting::add_to_waitlist;

pub fn eat_at_restaurant() {
    add_to_waitlist();
}
```


这样也正确，但是不符合习惯。因为没有清晰的指出函数是从哪里调用来的。

另一方面，使用 `use` 引入结构体、枚举和其他项时，习惯是指定它们的完整路径。

## 使用 as 提供新的名字

用 as 重命名防止两个相同名字的类型引入同一个作用域，

```rust
use std::fmt::Result;
use std::io::Result as IoResult;

fn function1() -> Result {
    // --snip--
}

fn function2() -> IoResult<()> {
    // --snip--
}
```


## 用pub use重导出名称

使用 `use` 关键字，将某个名称导入当前作用域后，这个名称在此作用域中就可以使用了，但它对此作用域之外还是私有的。

如果想让其他人调用我们的代码时，也能够正常使用这个名称，就好像它本来就在当前作用域一样，那我们可以将 `pub` 和 `use` 合起来使用。

这种技术被称为 “*重导出*（*re-exporting*）”：我们不仅将一个名称导入了当前作用域，还允许别人把它导入他们自己的作用域。

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```


现在这个 `pub use` 从根模块重导出了 `hosting` 模块，外部代码现在可以使用路径 `restaurant::hosting::add_to_waitlist`。

## 使用外部包

```
//
Cargo.toml
[dependencies]
rand
=
"0.8.5"
```


在 *Cargo.toml* 中加入 `rand` 依赖告诉了 Cargo 要从 [crates.io](https://crates.io/) 下载 `rand` 和其依赖，并使其可在项目代码中使用。

比如：

```rust
use rand::Rng;
fn main() {     let secret_number = rand::thread_rng().gen_range(1..=100);
}
```


## 嵌套路径消除 use

当需要引入很多定义于相同包或相同模块的项时，为每一项单独列出一行会占用源码很大的空间。

可以使用嵌套路径将相同的项在一行中引入作用域。这么做需要指定路径的相同部分，接着是两个冒号，接着是大括号中的各自不同的路径部分。

```rust
use std::cmp::Ordering;
use std::io;

// 优化之后：
use std::{cmp::Ordering, io};
```
比如：
```rust
use std::io;
use std::io::Write;

// =>
use std::io::{self, Write}; // 这一行便将 std::io 和 std::io::Write 同时引入作用域。
```


## 用 glob 将所有共有定义引入作用域。

如果希望将一个路径下 **所有** 公有项引入作用域，可以指定路径后跟 `*`，glob 运算符：

```cpp
use
std::collections::*;
```


用 glob 运算符时请多加小心！Glob 会使得我们难以推导作用域中有什么名称和它们是在何处定义的。

glob 运算符经常用于测试模块 `tests` 中，这时会将所有内容引入作用域；

**设置优化等级**

```
[profile.dev]
opt-level
=
0
[profile.release]
opt-level
=
3
```


## 将 crate 发布到 Crates.io

使用双斜杠 `//` 注释 Rust 代码。Rust 也有特定的用于文档的注释类型，通常被称为**文档注释**（*documentation comments*），它们会生成 HTML 文档。这些 HTML 展示公有 API 文档注释的内容，它们意在让对库感兴趣的程序员理解如何**使用**这个 crate，而不是它是如何被**实现**的。

```rust
/// Adds one to the number given.
///
/// # Examples
///
/// ```
/// let arg = 5;
/// let answer = my_crate::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```


**文档注释作为测试**

在文档注释中增加示例代码块是一个清楚的表明如何使用库的方法，这么做还有一个额外的好处：`cargo test` 也会像测试那样运行文档中的示例代码！

没有什么比有例子的文档更好的了，但最糟糕的莫过于写完文档后改动了代码，而导致例子不能正常工作。

文档注释风格 `//!` 为包含注释的项，而不是位于注释之后的项增加文档。这通常用于 crate 根文件（通常是 *src/lib.rs*）或模块的根文件为 crate 或模块整体提供文档。

以选择使用 `pub use` 重导出（re-export）项来使公有结构不同于私有结构。重导出获取位于一个位置的公有项并将其公开到另一个位置，好像它就定义在这个新位置一样。

**向 crate 添加元数据**

在发布之前，你需要在 crate 的 *Cargo.toml* 文件的 `[package]` 部分增加一些本 crate 的元数据（metadata）。

首先 crate 需要一个唯一的名称。

以及关于该 crate 用途的描述和用户可能在何种条款下使用该 crate 的 license。

比如：

```
[package]
name = "guessing_game"
version = "0.1.0"
edition = "2024"
description = "A fun game where you guess what number the computer has chosen."
license = "MIT OR Apache-2.0"

[dependencies]
```


## Cargo 工作空间

随着项目开发的深入，库 crate 持续增大，而你希望将其进一步拆分成多个库 crate。Cargo 提供了一个叫**工作空间**（*workspaces*）的功能，它可以帮助我们管理多个相关的协同开发的包。

**工作空间**是一系列共享同样的 *Cargo.lock* 和输出目录的包。

```
#
Cargo.toml
[workspace]
resolver
=
"3"
#
使用炫酷的最新版本解析算法
```
工作空间内的依赖：
```
[dependencies]
add_one
=
{ path = "../add_one" }
```


Rust 允许工作空间内的 crate 相互依赖，只需要在对应的cargo.toml中添加依赖即可。

为了在顶层 *add* 目录运行二进制 crate，可以通过 `-p` 参数和包名称来运行 `cargo run` 指定工作空间中我们希望使用的包：

```
$ cargo run -p adder
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.00s
Running `target/debug/adder`
Hello, world!
10 plus one is 11!
```
**依赖外部包**

```toml
[dependencies]
rand = "0.8.5"
```


但是只有在cargo.toml中写了rand的crate才可以引用它，不是在顶层写了就好。

如果这些依赖包是不兼容的同一依赖的不同版本，cargo会都下载，并尽量减少解析的版本数量。

在顶级 *add* 目录运行 `cargo test`。在像这样的工作空间结构中运行 `cargo test` 会运行工作空间中所有 crate 的测试。

**用 cargo install 安装二进制文件**

所有来自 `cargo install` 的二进制文件都安装到 Rust 安装根目录的 *bin* 文件夹中。如果你是使用 *rustup.rs* 来安装 Rust 且没有自定义任何配置，这个目录将是 *HOME/.cargo/bin∗。确保将这个目录添加到‘HOME/.cargo/bin*。确保将这个目录添加到 `HOME/.cargo/bin∗。确保将这个目录添加到‘PATH`环境变量中就能够运行通过`cargo install` 安装的程序了。

比如：`cargo install ripgrep`

**cargo 自定义拓展命令**

如果 `$PATH` 中有类似 `cargo-something` 的二进制文件，就可以通过 `cargo something` 来像 Cargo 子命令一样运行它。像这样的自定义命令也可以运行 `cargo --list` 来展示出来。

# 错误处理

Rust 将错误分为两大类：**可恢复的**（*recoverable*）和 **不可恢复的**（*unrecoverable*）错误。

对于一个可恢复的错误，比如文件未找到的错误，我们很可能只想向用户报告问题并重试操作。

不可恢复的错误总是 bug 出现的征兆，比如试图访问一个超过数组末端的位置，因此我们要立即停止程序。

Rust 没有异常。相反，它有 `Result<T, E>` 类型，用于处理可恢复的错误，还有 `panic!` 宏，在程序遇到不可恢复的错误时停止执行。

## panic! 处理不可恢复错误

Rust 有 `panic!`宏。在实践中有两种方法造成 panic：执行会造成代码 panic 的操作（比如访问超过数组结尾的内容）或者显式调用 `panic!` 宏。

这两种情况都会使程序 panic。

通常情况下这些 panic 会打印出一个错误信息，展开并清理栈数据，然后退出。

通过一个环境变量，你也可以让 Rust 在 panic 发生时打印调用堆栈（call stack）以便于定位 panic 的原因。

**[对应 panic 时的栈展开或终止](https://kaisery.github.io/trpl-zh-cn/ch09-01-unrecoverable-errors-with-panic.html#%E5%AF%B9%E5%BA%94-panic-%E6%97%B6%E7%9A%84%E6%A0%88%E5%B1%95%E5%BC%80%E6%88%96%E7%BB%88%E6%AD%A2)**

当出现 panic 时，程序默认会开始 **展开**（*unwinding*），这意味着 Rust 会回溯栈并清理它遇到的每一个函数的数据，不过这个回溯并清理的过程有很多工作。另一种选择是直接 **终止**（*abort*），这会不清理数据就退出程序。

那么程序所使用的内存需要由操作系统来清理。如果你需要项目的最终二进制文件越小越好，panic 时通过在 *Cargo.toml* 的 `[profile]` 部分增加 `panic = 'abort'`，可以由展开切换为终止。

例如，如果你想要在 release 模式中 panic 时直接终止：

```
[profile.release]
panic
=
'abort'
```


## 使用 panic! 的 backtrace

比如，当索引超出数组范围时。会出现panic。

可以在运行时：`RUST_BACKTRACE=1 cargo run`来获取panic时的堆栈情况。

为了获取带有这些信息的 backtrace，必须启用 debug 标识。

Rust 的 backtrace 跟其他语言中的一样：阅读 backtrace 的关键是从头开始读直到发现你编写的文件。

##　Result 处理可恢复错误

`Result` 枚举，它定义有如下两个成员，`Ok` 和 `Err`：

```
enum
Result<T,
E>
{     Ok
(T),     Err
(E), }
```


`T` 和 `E` 是泛型类型参数；

```rust
use std::fs::File;
fn main() {     let greeting_file_result = File::open("hello.txt");
}
```


`File::open` 的返回值是 `Result<T, E>`。

泛型参数 `T` 会被 `File::open` 的实现放入成功返回值的类型 `std::fs::File`，这是一个文件句柄。

错误返回值使用的 `E` 的类型是 `std::io::Error`。

这些返回类型意味着 `File::open` 调用可能成功并返回一个可以读写的文件句柄。这个函数调用也可能会失败：例如，也许文件不存在，或者可能没有权限访问这个文件。

`File::open` 函数需要一个方法在告诉我们成功与否的同时返回文件句柄或者错误信息。这些信息正好是 `Result` 枚举所代表的。

当 `File::open` 成功时，`greeting_file_result` 变量将会是一个包含文件句柄的 `Ok` 实例。

当失败时，`greeting_file_result` 变量将会是一个包含了更多关于发生了何种错误的信息的 `Err` 实例。

```rust
use std::fs::File;

fn main() {
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
        Err(error) => panic!("Problem opening the file: {error:?}"),
    }; // 处理枚举
}
```
**匹配不同的错误**
```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {e:?}"),
            },
            _ => {
                panic!("Problem opening the file: {error:?}");
            }
        },
    };
}
```


**失败时 panic 的简写：unwrap 和 expect**

`esult<T, E>` 类型定义了很多辅助方法来处理各种情况。

其中之一叫做 `unwrap`，它的实现就类似于 `match` 语句。

如果 `Result` 值是成员 `Ok`，`unwrap` 会返回 `Ok` 中的值。

如果 `Result` 是成员 `Err`，`unwrap` 会为我们调用 `panic!`。

例子：

```rust
use std::fs::File;

fn main() {
    let greeting_file = File::open("hello.txt").unwrap();
}
```


还有另一个类似于 `unwrap` 的方法它还允许我们选择 `panic!` 的错误信息：`expect`。

使用 `expect` 而不是 `unwrap` 并提供一个好的错误信息可以表明你的意图并更易于追踪 panic 的根源。

`expect` 的语法看起来像这样：

```rust
use std::fs::File;

fn main() {
    let greeting_file = File::open("hello.txt")
        .expect("hello.txt should be included in this project");
}
```


**传播错误**

当编写一个其实先会调用一些可能会失败的操作的函数时，除了在这个函数中处理错误外，还可以选择让调用者知道这个错误并决定该如何处理。

这被称为 **传播**（*propagating*）错误，这样能更好的控制代码调用，因为比起你代码所拥有的上下文，调用者可能拥有更多信息或逻辑来决定应该如何处理错误。

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let username_file_result = File::open("hello.txt");

    let mut username_file = match username_file_result {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut username = String::new();

    match username_file.read_to_string(&mut username) {
        Ok(_) => Ok(username),
        Err(e) => Err(e),
    }
}
```


这种传播错误的模式在 Rust 是如此的常见，以至于 Rust 提供了 `?` 问号运算符来使其更易于处理。

## 传播错误简写：？运算符

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username_file = File::open("hello.txt")?;
    let mut username = String::new();
    username_file.read_to_string(&mut username)?;
    Ok(username)
}
```


`Result` 值之后的 `?` 被定义为与示例 9-6 中定义的处理 `Result` 值的 `match` 表达式有着完全相同的工作方式。

如果 `Result` 的值是 `Ok`，这个表达式将会返回 `Ok` 中的值而程序将继续执行。

如果值是 `Err`，`Err` 将作为整个函数的返回值，就好像使用了 `return` 关键字一样，这样错误值就被传播给了调用者。

甚至可以在 `?` 之后直接使用链式方法调用来进一步缩短代码：

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username = String::new();

    File::open("hello.txt")?.read_to_string(&mut username)?;

    Ok(username)
}
```


**哪里可以使用 ？运算符**

`?` 运算符只能被用于返回值与 `?` 作用的值相兼容的函数。因为 `?` 运算符被定义为从函数中提早返回一个值，这与 `match` 表达式有着完全相同的工作方式。

`match` 作用于一个 `Result` 值，提早返回的分支返回了一个 `Err(e)` 值。函数的返回值必须是 `Result` 才能与这个 `return` 相兼容。

```rust
use std::fs::File;
fn main() {     let greeting_file = File::open("hello.txt")?;
} // 错误，只能返回 Result
```


`?` 也可用于 `Option<T>` 值。如同对 `Result` 使用 `?` 一样，只能在返回 `Option` 的函数中对 `Option` 使用 `?`。

在 `Option<T>` 上调用 `?` 运算符的行为与 `Result<T, E>` 类似：如果值是 `None`，此时 `None` 会从函数中提前返回。

如果值是 `Some`，`Some` 中的值作为表达式的返回值同时函数继续。

`main` 函数也可以返回 `Result<(), E>`。

```rust
use std::error::Error;
use std::fs::File;

fn main() -> Result<(), Box<dyn Error>> {
    let greeting_file = File::open("hello.txt")?;

    Ok(())
}
```


`main` 函数也可以返回任何实现了 [`std::process::Termination` trait](https://doc.rust-lang.org/std/process/trait.Termination.html) 的类型，它包含了一个返回 `ExitCode` 的 `report` 函数。

## 要不要panic

**示例、代码原型和测试都非常适合 panic**

测试失败的时候，直接panic以结束程序。

**当我们比编译器知道更多的情况**

当你有一些其他的逻辑来确保 `Result` 会是 `Ok` 值时，调用 `unwrap` 或者 `expect` 也是合适的，虽然编译器无法理解这种逻辑。你仍然需要处理一个 `Result` 值：即使在你的特定情况下逻辑上是不可能的，你所调用的任何操作仍然有可能失败。

**错误处理指导原则**

在当有可能会导致有害状态的情况下建议使用 `panic!`

然而当错误预期会出现时，返回 `Result` 仍要比调用 `panic!` 更为合适。

**创建自定义类型进行有效性验证**

在每个函数中正确性的检查将是非常冗余的（并可能潜在的影响性能）。

相反我们可以创建一个新类型来将验证放入创建其实例的函数中，而不是到处重复这些检查。这样就可以安全地在函数签名中使用新类型并相信它们接收到的值。

比如：

```rust
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {value}.");
        }

        Guess { value }
    }

    pub fn value(&self) -> i32 {
        self.value
    }
}
```


# 泛型、Trait 和生命周期

泛型允许我们使用一个可以代表多种类型的占位符来替换特定类型，以此来减少代码冗余。让算法与类型分离。

## 泛型

Rust不支持泛型特化，但是可以通过trait实现类似功能。

**泛型函数**

使用泛型为像函数签名或结构体这样的项创建定义，这样它们就可以用于多种不同的具体数据类型。

为了参数化这个新函数中的这些类型，我们需要为类型参数命名。

Rust 类型名的命名规范是首字母大写驼峰式命名法（UpperCamelCase）。

为了定义泛型函数，类型参数声明位于函数名称与参数列表中间的尖括号 `<>` 中，像这样：`fn largest<T>(list: &[T]) -> &T`

```rust
fn largest<T>(list: &[T]) -> &T {
    let mut largest = &list[0];

    for item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let result = largest(&number_list);
    println!("The largest number is {result}");

    let char_list = vec!['y', 'm', 'a', 'q'];

    let result = largest(&char_list);
    println!("The largest char is {result}");
}
```
上面代码无法编译。
```rust
error[E0369]: binary operation `>` cannot be applied to type `&T`
 --> src/main.rs:5:17
  |
5 |         if item > largest {
  |            ---- ^ ------- &T
  |            |    |
  |            |    &T
  |            &T
  |
  = help: consider restricting type parameter `T` with trait `PartialOrd`
  |
1 | fn largest<T: std::cmp::PartialOrd>(list: &[T]) -> &T {
  |             ++++++++++++++++++++++

For more information about this error, try `rustc --explain E0369`.
error: could not compile `chapter10` (bin "chapter10") due to 1 previous error
```


这个错误表明 `largest` 的函数体不能适用于 `T` 的所有可能的类型。因为在函数体需要比较 `T` 类型的值，不过它只能用于我们知道如何排序的类型。

**泛型结构体**

同样也可以用 `<>` 语法来定义结构体，它包含一个或多个泛型参数类型字段。

```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```
**泛型枚举**
```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```
**泛型方法**
```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };
    println!("p.x = {}", p.x());
}
```


必须在 `impl` 后面声明 `T`，这样就可以在 `Point<T>` 上实现的方法中使用 `T` 了。

通过在 `impl` 之后声明泛型 `T`，Rust 就知道 `Point` 的尖括号中的类型是泛型而不是具体类型。

定义方法时也可以为泛型指定限制（constraint）。

```rust
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```


结构体定义中的泛型类型参数并不总是与结构体方法签名中使用的泛型是同一类型。

比如：

```rust
struct Point<X1, Y1> {
    x: X1,
    y: Y1,
}

impl<X1, Y1> Point<X1, Y1> {
    fn mixup<X2, Y2>(self, other: Point<X2, Y2>) -> Point<X1, Y2> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c' };

    let p3 = p1.mixup(p2);

    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```


类型的混合。

**泛型的性能**

Rust 通过在编译时进行泛型代码的**单态化**（*monomorphization*）来保证效率。

单态化是一个通过填充编译时使用的具体类型，将通用代码转换为特定代码的过程。

泛型并不会使程序比具体类型运行得慢。

泛型 被编译器替换为了具体的定义。

因为 Rust 会将每种情况下的泛型代码编译为具体类型，使用泛型没有运行时开销。

当代码运行时，它的执行效率就跟好像手写每个具体定义的重复代码一样。

这个单态化过程正是 Rust 泛型在运行时极其高效的原因。

## Trait：定义共同行为

*trait* 定义了某个特定类型拥有可能与其他类型共享的功能。

可以通过 trait 以一种抽象的方式定义共同行为。

可以使用 *trait bounds* 指定泛型是任何拥有特定行为的类型。

*trait* 类似于其他语言中的常被称为 **接口**（*interfaces*）的功能，虽然有一些不同。

**定义 trait**

一个类型的行为由其可供调用的方法构成。

如果可以对不同类型调用相同的方法的话，这些类型就可以共享相同的行为了。

trait 定义是一种将方法签名组合起来的方法，目的是定义一个实现某些目的所必需的行为的集合。

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
```


在方法签名后跟分号，而不是在大括号中提供其实现。

接着每一个实现这个 trait 的类型都需要提供其自定义行为的方法体，编译器也会确保任何实现 `Summary` trait 的类型都拥有与这个签名的定义完全一致的 `summarize` 方法。

trait 体中可以有多个方法：一行一个方法签名且都以分号结尾。

trait 可以为内置类型实现函数。

**为类型实现 trait**

```rust
pub struct NewsArticle {}

pub struct Article<T> {
    a: T,
}

trait Summary {
    fn summarize(&self) {}
}

impl Summary for NewsArticle {
    fn summarize(&self) {}
}

impl<T> Summary for Article<T> {
    fn summarize(&self) {}
}

fn main() {
    let x = NewsArticle {};
    x.summarize();
}
```


crate 的用户可以像调用常规方法一样调用 `NewsArticle` 和 `SocialPost` 实例的 trait 方法了。

*但是不能为外部类型实现外部 trait。*

上面这句话错误，在rust最新版本，可以为外部类型实现外部 trait，但是要求不能trait的名字不能冲突。

**与method的关系**

```rust
struct Point<T> {
    x: T,
    y: T,
}

pub trait Summary {
    fn summarize(&self);
}

impl<T> Summary for Point<T> {
    fn summarize(&self) {
        println!("trait.")
    }
}

impl<T> Point<T> {
    fn summarize(&self) {
        println!("method.")
    }
}

fn func<T>(x: &T)
where
    T: Summary,
{
    x.summarize();
    println!("func.")
}

fn main() {
    let i: Point<i32> = Point { x: 1, y: 1 };
    func(&i);
    Summary::summarize(&i);
    i.summarize();
}
```
输出：
```
trait.   // 通过 trait bound 调用，是 trait 函数
func.
trait.   // 通过 trait 直接调用，肯定的，而且类似于多态。
method.  // 调用的是 method
```


**默认实现**

有时为 trait 中的某些或全部方法提供默认的行为，而不是在每个类型的每个实现中都定义自己的行为是很有用的。

这样当为某个特定类型实现 trait 时，可以选择保留或重载每个方法的默认行为。

```rust
pub
trait
Summary
{     fn summarize
(&self) -> String
{         String::from
("(Read more...)")     } }
```


但必须声明为类型实现`trait`否则不能使用默认实现。

**trait 作为参数**

```rust
pub fn notify(item: &impl Summary) {     println!("Breaking news! {}", item.summarize());
}
```


对于 `item` 参数，我们指定了 `impl` 关键字和 trait 名称，而不是具体的类型。

该参数支持任何实现了指定 trait 的类型。

**Trait Bound 语法**

`impl Trait` 语法更直观，但它实际上是更长形式的 *trait bound* 语法的语法糖。

```rust
pub fn notify<T: Summary>(item: &T) {     println!("Breaking news! {}", item.summarize());
}
```
对类型的trait进行限制。
```rust
pub fn notify(item1: &impl Summary, item2: &impl Summary) // item1 和 item2 允许不同类型。
pub fn notify<T: Summary>(item1: &T, item2: &T)  // item1 和 item2 必须是同样类型。
```


**通过 + 指定多个 trait bound**

假设我们希望 `notify` 在 `item` 上既能使用格式化显示，又能使用 `summarize` 方法：在 `notify` 的定义中，指定 `item` 必须同时实现 `Display` 和 `Summary` 两个 trait。这可以通过 `+` 语法实现：

```rust
pub fn notify(item: &(impl Summary + Display)) {
    // ...
}
```
也适合trait
bound
```rust
pub fn notify<T: Summary + Display>(item: &T) {
    // ...
}
```
**用
where
简化
trait
bound**
```rust
fn some_function<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {
    // ...
}
```
繁杂，太长，难以理解，不优雅。
```rust
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{
    // ...
}
```


简单有力，优雅，高效。

**返回实现了 trait 的类型**

在返回值中使用 `impl Trait` 语法，来返回实现了某个 trait 的类型：

```rust
fn returns_summarizable() -> impl Summary {
    SocialPost {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        repost: false,
    }
}
```


返回的类型必须实现了 Summary 的 trait。

**用trait bound有条件的实现**

通过使用带有 trait bound 的泛型参数的 `impl` 块，可以有条件地只为那些实现了特定 trait 的类型实现方法。

```rust
use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {}
}

impl<T> Pair<T>
where
    T: Display + PartialOrd,
{
    // --snip--
}
```


通过有条件的实现的类型方法，但是函数不允许重名，不允许重载。

可以有条件的新增行为。

## 生命周期

Rust 中的每一个引用都有其**生命周期**（*lifetime*），也就是引用保持有效的作用域。

大部分时候生命周期是隐含并可以推断的，正如大部分时候类型也是可以推断的一样。

**生命周期避免悬垂引用**

```rust
fn main() {
    let r;                // ---------+-- 'r
                          //          |
    {                     //          |
        let x = 5;        // -+-- 'x  |
        r = &x;           //  |       |
    }                     // -+       |
                          //          |
    println!("r: {r}");   //          |
} // 不可编译               // ---------+
```


**借用检查器**

Rust 编译器有一个**借用检查器**（*borrow checker*），它比较作用域来确保所有的借用都是有效的。

一个有效的引用，要求数据比引用有着更长的生命周期。

**函数中的泛型生命周期**

```rust
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";
    let result = longest(string1.as_str(), string2);
    println!("The longest string is {result}");
} // 无法编译，需要指定生命周期。
```


这个函数获取作为引用的字符串 slice，而不是字符串，因为我们不希望 `longest` 函数获取参数的所有权。

报错：

```rust
$ cargo run
   Compiling chapter10 v0.1.0 (file:///projects/chapter10)
error[E0106]: missing lifetime specifier
 --> src/main.rs:9:33
  |
9 | fn longest(x: &str, y: &str) -> &str {
  |               ----     ----     ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `x` or `y`
help: consider introducing a named lifetime parameter
  |
9 | fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
  |           ++++     ++          ++          ++

For more information about this error, try `rustc --explain E0106`.
error: could not compile `chapter10` (bin "chapter10") due to 1 previous error
```


提示返回值需要一个泛型生命周期参数，因为 Rust 并不知道将要返回的引用是指向 `x` 或 `y`。

事实上我们也不知道，因为函数体中 `if` 块返回一个 `x` 的引用而 `else` 块返回一个 `y` 的引用。

为了修复这个错误，我们将增加泛型生命周期参数来定义引用间的关系以便借用检查器可以进行分析。

**生命周期注解语法**

生命周期注解并不改变任何引用的生命周期的长短。

相反它们描述了多个引用生命周期相互的关系，而不影响其生命周期。

与当函数签名中指定了泛型类型参数后就可以接受任何类型一样，当指定了泛型生命周期后函数也能接受任何生命周期的引用。

生命周期参数名称必须以撇号（`'`）开头，其名称通常全是小写，类似于泛型，其名称非常短。

大多数人使用 `'a` 作为第一个生命周期注解。生命周期参数注解位于引用的 `&` 之后，并有一个空格来将引用类型与生命周期注解分隔开。

```rust
&i32        // 引用
&'a i32     // 带有显式生命周期的引用
&'a mut i32 // 带有显式生命周期的可变引用
```


单个的生命周期注解本身没有多少意义，因为生命周期注解告诉 Rust 多个引用的泛型生命周期参数如何相互联系的。

**函数签名的生命周期注解**

为了在函数签名中使用生命周期注解，需要在函数名和参数列表间的尖括号中声明泛型生命周期（*lifetime*）参数，就像泛型类型（*type*）参数一样。

函数签名表达如下限制：也就是这两个参数和返回的引用存活的一样久。

（两个）参数和返回的引用的生命周期是相关的。

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```


记住通过在函数签名中指定生命周期参数时，我们并没有改变任何传入值或返回值的生命周期，而是指出任何不满足这个约束条件的值都将被借用检查器拒绝。

注意 `longest` 函数并不需要知道 `x` 和 `y` 具体会存在多久，而只需要知道有某个可以被 `'a` 替代的作用域将会满足这个签名。

当在函数中使用生命周期注解时，这些注解出现在函数签名中，而不存在于函数体中的任何代码中。

生命周期注解成为了函数约定的一部分，非常像签名中的类型。

让函数签名包含生命周期约定意味着 Rust 编译器的工作变得更简单了。

如果函数注解有误或者调用方法不对，编译器错误可以更准确地指出代码和限制的部分。

如果不这么做的话，Rust 编译会对我们期望的生命周期关系做更多的推断，这样编译器可能只能指出离出问题地方很多步之外的代码。

但是如下的代码不能编译：

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    }

    println!("The longest string is {result}");
}
```


这是因为 string2 比 string1 活的时间短。

如果 string2 是 `&str` 字面量还可（生存周期是整个程序运行），但是是 `String` 的话，会进行`Drop`。

错误：

```rust
$ cargo run
   Compiling learn v0.1.0
error[E0597]: `string2` does not live long enough
 --> src/main.rs:7:44
  |
6 |         let string2 = String::from("xyz");
  |             ------- binding `string2` declared here
7 |         result = longest(string1.as_str(), &string2);
  |                                            ^^^^^^^^ borrowed value does not live long enough
8 |     }
  |     - `string2` dropped here while still borrowed
9 |     println!("The longest string is {result}");
  |                                     -------- borrow later used here

For more information about this error, try `rustc --explain E0597`.
error: could not compile `learn` (bin "learn") due to 1 previous error
```


错误表明`string2`活的时间不够长。

我们通过生命周期参数告诉 Rust 的是： `longest` 函数返回的引用的生命周期应该与传入参数的生命周期中较短那个保持一致。

**深入理解生命周期**

指定生命周期参数的正确方式依赖函数实现的具体功能。

例如，如果将 `longest` 函数的实现修改为总是返回第一个参数而不是最长的字符串 slice，就不需要为参数 `y` 指定一个生命周期。

（从另一个角度来说，就是需要类型的一致。）

如下代码将能够编译：

```rust
fn
longest<'a>(x: &'a
str,
y:
&str) -> &'a str {     x }
```


我们为参数 `x` 和返回值指定了生命周期参数 `'a`，不过没有为参数 `y` 指定，因为 `y` 的生命周期与参数 `x` 和返回值的生命周期没有任何关系。

当从函数返回一个引用，返回值的生命周期参数需要与一个参数的生命周期参数相匹配。如果返回的引用**没有**指向任何一个参数，那么唯一的可能就是它指向一个函数内部创建的值。

然而它将会是一个悬垂引用，因为它将会在函数结束时离开作用域。

```rust
fn longest<'a>(x: &str, y: &str) -> &'a str {     let result = String::from("really long string");
result.as_str() }
```


出现的问题是 `result` 在 `longest` 函数的结尾将离开作用域并被清理，而我们尝试从函数返回一个 `result` 的引用。无法指定生命周期参数来改变悬垂引用，而且 Rust 也不允许我们创建一个悬垂引用。

在这种情况，最好的解决方案是返回一个有所有权的数据类型而不是一个引用，这样函数调用者就需要负责清理这个值了。

综上，生命周期语法是用于将函数的多个参数与其返回值的生命周期进行关联的。

一旦它们形成了某种关联，Rust 就有了足够的信息来允许内存安全的操作并阻止会产生悬垂指针亦或是违反内存安全的行为。

**结构体定义中的生命周期注解**

结构体定义可以包含引用，不过这需要为结构体定义中的每一个引用添加生命周期注解。

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```


这个结构体只有一个字段 `part`，它存放了一个字符串 slice，这是一个引用。类似于泛型参数类型，必须在结构体名称后面的尖括号中声明泛型生命周期参数，以便在结构体定义中使用生命周期参数。

这个注解意味着 `ImportantExcerpt` 的实例不能比其 `part` 字段中的引用存在的更久。

注意，结构体当然也可以声明多个生命周期，毫无疑问的是。

结构体本身的生命周期取决于生命周期最短的那个。

**生命周期缺省（Lifetime Elision）**

每一个引用都有一个生命周期，而且我们需要为那些使用了引用的函数或结构体指定生命周期。

但是存在一些情况不需要生命周期的注解。

比如：

```rust
fn first_word(s: &str) -> &str {     let bytes = s.as_bytes();
for (i, &item) in bytes.iter().enumerate() {         if item == b' ' {             return &s[0..i];
}     }      &s[..] }
```


这是因为特定情况下，是可以预测的，遵守着几种模式。

被编码进 Rust 引用分析的模式被称为 **生命周期省略规则**（*lifetime elision rules*）。

这并不是需要程序员遵守的规则；这些规则是一系列特定的场景，此时编译器会考虑，如果代码符合这些场景，就无需明确指定生命周期。

函数或方法的参数的生命周期被称为 **输入生命周期**（*input lifetimes*），

而返回值的生命周期被称为 **输出生命周期**（*output lifetimes*）。

编译器采用三条规则来判断引用何时不需要明确的注解。

第一条规则是编译器**为每一个引用参数都分配一个生命周期参数。**换句话说就是，函数有一个引用参数的就有一个生命周期参数：`fn foo<'a>(x: &'a i32)`，有两个引用参数的函数就有两个不同的生命周期参数，`fn foo<'a, 'b>(x: &'a i32, y: &'b i32)`，依此类推。

第二条规则是**如果只有一个输入生命周期参数，那么它被赋予所有输出生命周期参数**：`fn foo<'a>(x: &'a i32) -> &'a i32`。

第三条规则是如果方法有多个输入生命周期参数并且其中一个参数是 `&self` 或 `&mut self`，说明这是个方法，那么**所有输出生命周期参数被赋予 `self` 的生命周期。**第三条规则使得方法更容易读写，因为只需更少的符号。

**方法中的生命周期注解**

（实现方法时）结构体字段的生命周期必须总是在 `impl` 关键字之后声明并在结构体名称之后被使用，因为这些生命周期是结构体类型的一部分。

适用于第三条生命周期省略规则的例子：

```rust
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {announcement}");
        self.part
    }
}
```


这里有两个输入生命周期，所以 Rust 应用第一条生命周期省略规则并给予 `&self` 和 `announcement` 它们各自的生命周期。

接着，因为其中一个参数是 `&self`，返回值类型被赋予了 `&self` 的生命周期，这样所有的生命周期都被计算出来了。

感觉这个部分讲的不是非常好，因为生命周期被计算之后，需要和实际的返回值进行演算。如果返回值遵守了所计算出的生命周期之后，才能证明是无误的。

**静态生命周期**

这里有一种特殊的生命周期值得讨论：`'static`，其生命周期**能够**存活于整个程序期间。

所有的字符串字面值都拥有 `'static` 生命周期，我们也可以选择像下面这样标注出来：`let s: &'static str = "I have a static lifetime.";`

你可能在错误信息的帮助文本中见过使用 `'static` 生命周期的建议，不过将引用指定为 `'static` 之前，思考一下这个引用是否真的在整个程序的生命周期里都有效，以及你是否希望它存在得这么久。

大部分情况中，推荐 `'static` 生命周期的错误信息都是尝试创建一个悬垂引用或者可用的生命周期不匹配的结果。在这种情况下的解决方案是修复这些问题而不是指定一个 `'static` 的生命周期。

**结合泛型类型参数、trait bounds 和生命周期**

```rust
use std::fmt::Display;
fn longest_with_an_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: Display,
{
    println!("Announcement! {ann}");
    if x.len() > y.len() { x } else { y }
}
```


# 测试与宏

Rust 包含了编写自动化软件测试的功能支持。

## 编写测试

测试函数体通常执行如下三种操作：

* 设置任何所需的数据或状态
* 运行需要测试的代码
* 断言其结果是我们所期望的

**测试函数**

Rust 中的测试就是一个带有 `test` 属性注解的函数。

属性（attribute）是关于 Rust 代码片段的元数据

为了将一个函数变成测试函数，需要在 `fn` 行之前加上 `#[test]`。

当使用 `cargo test` 命令运行测试时，Rust 会构建一个测试执行程序用来调用被标注的函数，并报告每一个测试是通过还是失败。

```rust
pub fn add(left: u64, right: u64) -> u64 {     left + right }  #[cfg(test)] mod tests {     use super::*;
#[test]     fn it_works() {         let result = add(2, 2);
assert_eq!(result, 4);
} }
```


`fn` 行之前的 `#[test]`：这个属性表明这是一个测试函数，这样测试执行者就知道将其作为测试处理。

`tests` 模块中也可以有非测试的函数来帮助我们建立通用场景或进行常见操作，必须每次都标明哪些函数是测试。

通过使用 `assert_eq!` 宏来断言 `result`。

测试如下：

```
// 成功
$ cargo test
   Compiling learn v0.1.0
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.40s
     Running unittests src/main.rs (target/debug/deps/learn-fec18b069545b35a.exe)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

// 失败
$ cargo test
   Compiling learn v0.1.0
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.48s
     Running unittests src/main.rs (target/debug/deps/learn-fec18b069545b35a.exe)

running 1 test
test tests::it_works ... FAILED

failures:

---- tests::it_works stdout ----
thread 'tests::it_works' panicked at src/main.rs:12:9:
assertion `left == right` failed
  left: 4
 right: 5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

failures:
    tests::it_works

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--bin learn`
```


可以将参数传递给 `cargo test` 命令，以便只运行名称与字符串匹配的测试；这就是所谓的**过滤**（*filtering*）。

`assert!` 宏由标准库提供，在希望确保测试中一些条件为 `true` 时非常有用。

和`assert_eq!`差不多

`assert_eq!`和`assert_ne!`宏检测是否相等。

当断言失败时，这些宏会使用调试格式打印出其参数，这意味着被比较的值必须实现了 `PartialEq` 和 `Debug` trait。

所有的基本类型和大部分标准库类型都实现了这些 trait。

对于自定义的结构体和枚举，需要实现 `PartialEq` 才能断言它们的值是否相等。

需要实现 `Debug` 才能在断言失败时打印它们的值。

因为这两个 trait 都是派生 trait，通常可以直接在结构体或枚举上添加 `#[derive(PartialEq, Debug)]` 注解。

**自定义失败信息**

以向 `assert!`、`assert_eq!` 和 `assert_ne!` 宏传递一个可选的失败信息参数，可以在测试失败时将自定义失败信息一同打印出来。

任何在 `assert!` 的一个必需参数和 `assert_eq!` 和 `assert_ne!` 的两个必需参数之后指定的参数都会传递给 `format!` 宏，所以可以传递一个包含 `{}` 占位符的格式字符串和需要放入占位符的值。

**用 should\_panic 检查 panic**

```rust
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {value}.");
        }

        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```


然而 `should_panic` 测试结果可能会非常含糊不清。

`should_panic` 甚至在一些不是我们期望的原因而导致 panic 时也会通过。

为了使 `should_panic` 测试结果更精确，我们可以给 `should_panic` 属性增加一个可选的 `expected` 参数。

测试工具会确保错误信息中包含其提供的文本。

```rust
// --snip--
impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 {
            panic!("Guess value must be greater than or equal to 1, got {value}.");
        } else if value > 100 {
            panic!("Guess value must be less than or equal to 100, got {value}.");
        }

        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic(expected = "less than or equal to 100")]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```


这个测试会通过，因为 `should_panic` 属性中 `expected` 参数提供的值是 `Guess::new` 函数 panic 信息的子串。

我们可以指定期望的整个 panic 信息，在这个例子中是 `Guess value must be less than or equal to 100, got 200.` 。

`expected` 信息的选择取决于 panic 信息有多独特或动态，和你希望测试有多准确。在这个例子中，错误信息的子字符串足以确保函数在 `else if value > 100` 的情况下运行。

这种情况下，需要panic的信息的字串存在`expected`。

**用Result<T,E>测试**

```rust
pub
fn
add
(left: u64, right: u64)
->
u64
{     left + right }
#[cfg
(test)]
mod
tests
{     use super::*;      // ANCHOR: here     #[test]     fn it_works
() -> Result<
(), String>
{         let result = add
(2, 2);          if result == 4
{             Ok
(
())         } else
{             Err
(String::from
("two plus two does not equal four"))         }     }     // ANCHOR_END: here }
```


在函数体中，不同于调用 `assert_eq!` 宏，而是在测试通过时返回 `Ok(())`，在测试失败时返回带有 `String` 的 `Err`。

这样编写测试来返回 `Result<T, E>` 就可以在函数体中使用问号运算符，如此可以方便的编写任何运算符会返回 `Err` 成员的测试。

不能对这些使用 `Result<T, E>` 的测试使用 `#[should_panic]` 注解。为了断言一个操作返回 `Err` 成员，*不要* 对 `Result<T, E>` 值使用问号表达式（`?`）。而是使用 `assert!(value.is_err())`。

## 控制测试

`cargo test` 产生的二进制文件的默认行为是并发运行所有的测试，并截获测试运行过程中产生的输出，阻止它们被显示出来，使得阅读测试结果相关的内容变得更容易。

不过可以指定命令行参数来改变 `cargo test` 的默认行为。

**并行与否**

如果你不希望测试并行运行，或者想要更加精确的控制线程的数量，可以传递 `--test-threads` 参数和希望使用线程的数量给测试二进制文件。例如：

```
$
cargo
test
--
--test-threads=1
```


**显示函数输出**

在测试中调用了 `println!` 而测试通过了，我们将不会在终端看到 `println!` 的输出：只会看到说明测试通过的提示行。

如果测试失败了，则会看到所有标准输出和其他错误信息。

如果你希望也能看到通过的测试中打印的值，也可以在结尾加上 `--show-output` 告诉 Rust 显示成功测试的输出。

```
$
cargo
test
--
--show-output
```


**通过名称运行部分测试**

向 `cargo test` 传递所希望运行的测试名称的参数来选择运行哪些测试。

```rust
pub fn add_two(a: usize) -> usize {     a + 2 }  #[cfg(test)] mod tests {     use super::*;
#[test]     fn add_two_and_two() {         let result = add_two(2);
assert_eq!(result, 4);
}      #[test]     fn add_three_and_two() {         let result = add_two(3);
assert_eq!(result, 5);
}      #[test]     fn one_hundred() {         let result = add_two(100);
assert_eq!(result, 102);
} }
```
通过名称运行单个测试
```
$ cargo test one_hundred
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.69s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 1 test
test tests::one_hundred ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 2 filtered out; finished in 0.00s
```
过滤运行多个测试：
```
$ cargo test add
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.61s
     Running unittests src/lib.rs (target/debug/deps/adder-92948b65e88960b4)

running 2 tests
test tests::add_three_and_two ... ok
test tests::add_two_and_two ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out; finished in 0.00s
```


我们可以指定部分测试的名称，任何名称匹配这个名称的测试会被运行。

注意测试所在的模块也是测试名称的一部分，所以可以通过过滤模块名来运行一个模块中的所有测试。

**除非指定，否则忽略**

通过`ignore`来忽略某些测试。

```rust
#[cfg(test)] mod tests {     use super::*;
#[test]     fn it_works() {         let result = add(2, 2);
assert_eq!(result, 4);
}      #[test]     #[ignore]     fn expensive_test() {         // code that takes an hour to run     } }
```


`expensive_test` 被列为 `ignored`，如果我们只希望运行被忽略的测试，可以使用 `cargo test -- --ignored`：

如果你希望不管是否忽略都要运行全部测试，可以运行 `cargo test -- --include-ignored`。

## 单元测试与集成测试

**单元测试**倾向于更小而更集中，在隔离的环境中一次测试一个模块，并且可以测试私有接口。

**集成测试**对于你的库来说则完全是外部的。它们与其他外部代码一样，通过相同的方式使用你的代码，只测试公有接口而且每个测试都有可能会测试多个模块。

**单元测试**

单元测试的目的是在与其他部分隔离的环境中测试每一个单元的代码，以便于快速而准确地验证某个单元的代码功能是否符合预期。单元测试与它们要测试的代码共同存放在位于 *src* 目录下相同的文件中。规范是在每个文件中创建包含测试函数的 `tests` 模块，并使用 `cfg(test)` 标注模块。

测试模块的 `#[cfg(test)]` 注解告诉 Rust 只在执行 `cargo test` 时才编译和运行测试代码，而在运行 `cargo build` 时不这么做。

与之对应的集成测试因为位于另一个文件夹，所以它们并不需要 `#[cfg(test)]` 注解。

`cfg` 属性代表**配置**（*configuration*），它告诉 Rust 接下来的项只有在给定特定配置选项时，才会被包含。

**集成测试**

为了编写集成测试，需要在项目根目录创建一个 *tests* 目录，与 *src* 同级。Cargo 知道如何去寻找这个目录中的集成测试文件。接着可以随意在这个目录中创建任意多的测试文件，Cargo 会将每一个文件当作单独的 crate 来编译。

因为每一个 *tests* 目录中的测试文件都是完全独立的 crate，所以需要将库引入到每个测试 crate 的作用域中。

`tests` 文件夹在 Cargo 中是一个特殊的文件夹，Cargo 只会在运行 `cargo test` 时编译这个目录中的文件。

可以通过指定测试函数的名称作为 `cargo test` 的参数来运行特定集成测试。

*tests* 目录中的每一个文件都被编译成一个单独的 crate，这有助于创建独立的作用域，以便更接近于最终用户使用你的 crate 的方式。但这意味着，*tests* 目录中的文件的行为，和 *src* 中的文件的行为不一样。

**二进制 crate 的集成测试**

如果项目是二进制 crate 并且只包含 *src/main.rs* 而没有 *src/lib.rs*，这样就不可能在 *tests* 目录创建集成测试并也无法通过 `use` 语句将 *src/main.rs* 中定义的函数引入作用域。只有库 crate 才会向其他 crate 暴露了可供调用和使用的函数；二进制 crate 只意在单独运行。

这就是许多 Rust 二进制项目使用一个简单的 *src/main.rs* 调用 *src/lib.rs* 中的逻辑的原因之一。因为通过这种结构，集成测试**就可以**通过 `use` 来测试库 crate 中的重要功能了。而如果这些重要的功能没有问题的话，*src/main.rs* 中的少量代码也就会正常工作且不需要测试。

# 闭包与迭代器

## 闭包

Rust 的 **闭包**（*closures*）是可以保存在变量中或作为参数传递给其他函数的匿名函数。

闭包通常不要求像 `fn` 函数那样对参数和返回值进行类型注解。函数需要类型注解是因为这些类型是暴露给用户的显式接口的一部分。

闭包并不用于这样暴露在外的接口：它们储存在变量中并被使用，不用命名它们或暴露给库的用户调用。

闭包通常较短，并且只与特定的上下文相关，而不是适用于任意情境。在这些有限的上下文中，编译器可以推断参数和返回值的类型，类似于它推断大多数变量类型的方式（尽管在某些罕见的情况下，编译器也需要闭包的类型注解）。

严格定义：

```rust
let expensive_closure = |num: u32| -> u32 {         println!("calculating slowly...");
thread::sleep(Duration::from_secs(2));
num     };
```
其他方式定义：
```rust
fn  add_one_v1   (x: u32) -> u32 { x + 1 } let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```


调用闭包是 `add_one_v3` 和 `add_one_v4` 能够编译的必要条件，因为类型将从其用法中推断出来。这类似于 `let v = Vec::new();`，Rust 需要类型注解或是某种类型的值被插入到 `Vec` 中，才能推断其类型。

```rust
let example_closure = |x| x;
let s = example_closure(String::from("hello"));
let n = example_closure(5);
```


不可编译，因为两次调用类型不同。

### 捕获

闭包可以通过三种方式捕获其环境中的值，它们直接对应到函数获取参数的三种方式：**不可变借用、可变借用和获取所有权。**

闭包将根据函数体中对捕获值的操作来决定使用哪种方式。

```rust
let list = vec![1, 2, 3];
let only_borrows = || println!("From closure: {list:?}");
```
only\_borrows
只是打印，所以只需要不可变引用。
```rust
let mut list = vec![1, 2, 3];
let mut borrows_mutably = || list.push(7);
```


这里则是可变引用，想来，应该和C++一样，捕获发生在闭包定义的时候，而非调用的时候。

即使闭包体不严格需要所有权，如果希望强制闭包获取它在环境中所使用的值的所有权，可以在参数列表前使用 `move` 关键字。

比如：

```rust
use std::thread;
fn main() {     let list = vec![1, 2, 3];
println!("Before defining closure: {list:?}");
thread::spawn(move || println!("From thread: {list:?}"))         .join()         .unwrap();
}
```


把所有权进行转移。这在开线程的时候很好用。

### 将捕获移出闭包

一旦闭包捕获了定义它的环境中的某个值的引用或所有权），闭包体中的代码则决定了在稍后执行闭包时，这些引用或值将如何处理。

闭包体可以执行以下任一操作：将一个捕获的值移出闭包，修改捕获的值，既不移动也不修改值，或者一开始就不从环境中捕获任何值。

闭包捕获和处理环境中的值的方式会影响闭包实现哪些 trait，而 trait 是函数和结构体指定它们可以使用哪些类型闭包的方式。

根据闭包体如何处理这些值，闭包会自动、渐进地实现一个、两个或全部三个 `Fn` trait。

1. `FnOnce` 适用于只能被调用一次的闭包。所有闭包至少都实现了这个 trait，因为所有闭包都能被调用。一个会将捕获的值从闭包体中移出的闭包只会实现 `FnOnce` trait，而不会实现其他 `Fn` 相关的 trait，因为它只能被调用一次。
2. `FnMut` 适用于不会将捕获的值移出闭包体，但可能会修改捕获值的闭包。这类闭包可以被调用多次。
3. `Fn` 适用于既不将捕获的值移出闭包体，也不修改捕获值的闭包，同时也包括不从环境中捕获任何值的闭包。这类闭包可以被多次调用而不会改变其环境，这在会多次并发调用闭包的场景中十分重要。

移出：FnOnce -> 显示或隐式获取了值的所有权，闭包退出后，值无效。比如：调用了vec的push

不移出但修改：FnMut -> 仅获取可变所有权

不移出不修改：Fn -> 仅获取不可变所有权

要求从低到高；灵活度从高到低。

这代表了一种传递时的要求，避免接收方误用。

所以，可以看到，`function`、`method`和`closure`分得很清。

这三个要求与其说是对函数的要求，不如说是对调用方的要求。

**注意：**如果我们要做的事情不需要从环境中捕获值，则可以在需要某种实现了 `Fn` trait 的东西时使用函数而不是闭包。举个例子，可以在 `Option<Vec<T>>` 的值上调用 `unwrap_or_else(Vec::new)`，以便在值为 `None` 时获取一个新的空的 vector。编译器会自动为函数定义实现适用的 `Fn` trait。

## 迭代器

迭代器模式允许你依次对一个序列中的项执行某些操作。**迭代器**（*iterator*）负责遍历序列中的每一项并确定序列何时结束的逻辑。

在 Rust 中，迭代器是**惰性的**（*lazy*），这意味着在调用消费迭代器的方法之前不会执行任何操作。

```rust
let v1 = vec![1, 2, 3];
let v1_iter = v1.iter();
```


这段代码本身没有执行任何操作

### Iterator trait 和 next 方法

在迭代器上调用 `next` 方法会改变迭代器内部的状态，该状态用于跟踪迭代器在序列中的位置。换句话说，代码**消费**（consume）了，或者说用尽了迭代器。每一次 `next` 调用都会从迭代器中消费一个项。

调用 `next` 方法的方法被称为**消费适配器**（*consuming adaptors*），因为调用它们会消耗迭代器。

`Iterator` trait 中定义了另一类方法，被称为**迭代器适配器**（*iterator adaptors*），它们不会消耗当前的迭代器，而是通过改变原始迭代器的某些方面来生成不同的迭代器。

# 智能指针

**指针**（*pointer*）是一个包含内存地址的变量的通用概念。这个地址引用，或 “指向”（points at）一些其它数据。Rust 中最常见的指针是第四章介绍的**引用**。引用以 `&` 符号为标志并借用了它们所指向的值。除了引用数据没有任何其他特殊功能，也没有额外开销。

另一方面，**智能指针**（*smart pointers*）是一类数据结构，它们的表现类似指针，但是也拥有额外的元数据和功能。它们提供了多于引用的额外功能。

智能指针的例子，这包括**引用计数** （*reference counting*）智能指针类型。这种指针允许数据有多个所有者，它会记录所有者的数量，当没有所有者时清理数据。

在 Rust 中因为引用和借用的概念，普通引用和智能指针有一个额外的区别：引用是一类只借用数据的指针，在大部分情况下，智能指针**拥有**它们指向的数据。

智能指针通常使用结构体实现。智能指针不同于结构体的地方在于其实现了 `Deref` 和 `Drop` trait。`Deref` trait 允许智能指针结构体实例表现的像引用一样，这样就可以编写既用于引用、又用于智能指针的代码。`Drop` trait 允许我们自定义当智能指针离开作用域时运行的代码。

* `Box<T>`，用于在堆上分配值
* `Rc<T>`，一个引用计数类型，其数据可以有多个所有者
* `Ref<T>` 和 `RefMut<T>`，通过 `RefCell<T>` 访问。`RefCell<T>` 是一个在运行时而不是在编译时执行借用规则的类型。

## Box<T>

最简单直接的智能指针是 *box*，其类型是 `Box<T>`。

box 允许你将一个值放在堆上而不是栈上。

**Box 允许递归**

**递归类型**（*recursive type*）的值可以拥有另一个同类型的值作为其自身的一部分。而 box 有一个已知的大小，所以通过在循环类型定义中插入 box，就可以创建递归类型了。

**const list**

cons list 的每一项都包含两个元素：当前项的值和下一项。其最后一项值包含一个叫做 `Nil` 的值且没有下一项。

如：

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}
```


`Box<T>` 类型是一个智能指针，因为它实现了 `Deref` trait，它允许 `Box<T>` 值被当作引用对待。当 `Box<T>` 值离开作用域时，由于 `Box<T>` 类型 `Drop` trait 的实现，box 所指向的堆数据也会被清除。

## Deref Trait

实现 `Deref` trait 允许我们定制**解引用运算符**（*dereference operator*）`*`。

实现 `Deref` trait 的智能指针可以被当作常规引用来对待，可以编写操作引用的代码并同样适用于智能指针。

**追踪指针的值**

常规引用是一个指针类型，一种理解指针的方式是将其看成指向储存在其他某处值的箭头。

```rust
fn main() {     let x = 5;
let y = Box::new(x); // 指向 x 的一个拷贝      assert_eq!(5, x);     assert_eq!(5, *y); }
```
**实现
Deref
trait**
```rust
use std::ops::Deref;

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
```


`type Target = T;` 语法定义了用于此 trait 的关联类型。

没有 `Deref` trait 的话，编译器只会解引用 `&` 引用类型。

`deref` 方法向编译器提供了获取任何实现了 `Deref` trait 的类型的值，并且调用这个类型的 `deref` 方法来获取一个它知道如何解引用的 `&` 引用的能力。

也就是：`*(y.deref())`

类似于C++的重载操作符。

但是由于接口的限制，只允许不可变引用，。

注意，每次当我们在代码中使用 `*` 时， `*` 运算符都被替换成了先调用 `deref` 方法再接着使用 `*` 解引用的操作，且只会发生一次，不会对 `*` 操作符无限递归替换

**函数和方法的隐式 Deref 强制转换**

**Deref 强制转换**（*deref coercions*）将实现了 `Deref` trait 的类型的引用转换为另一种类型的引用。例如，Deref 强制转换可以将 `&String` 转换为 `&str`，因为 `String` 实现了 `Deref` trait 因此可以返回 `&str`。

Deref 强制转换是 Rust 在函数或方法传参上的一种便利操作，并且只能作用于实现了 `Deref` trait 的类型。

因为强转型，下面代码可以的：

```rust
fn main() {     let m = MyBox::new(String::from("Rust"));
hello(&m);
}
```


Rust 可以通过 `deref` 调用将 `&MyBox<String>` 变为 `&String`。标准库中提供了 `String` 上的 `Deref` 实现，其会返回字符串 slice，这可以在 `Deref` 的 API 文档中看到。Rust 再次调用 `deref` 将 `&String` 变为 `&str`，这就符合 `hello` 函数的定义了。

当所涉及到的类型定义了 `Deref` trait，Rust 会分析这些类型并使用任意多次 `Deref::deref` 调用以获得匹配参数的类型。这些解析都发生在编译时，所以利用 Deref 强制转换并没有运行时开销！

ust 在发现类型和 trait 实现满足三种情况时会进行 Deref 强制转换：

1. 当 `T: Deref<Target=U>` 时从 `&T` 到 `&U`。
2. 当 `T: DerefMut<Target=U>` 时从 `&mut T` 到 `&mut U`。
3. 当 `T: Deref<Target=U>` 时从 `&mut T` 到 `&U`。

**Drop Trait 清理代码**

指定在值离开作用域时应该执行的代码的方式是实现 `Drop` trait。

`Drop` trait 要求实现一个叫做 `drop` 的方法，它获取一个 `self` 的可变引用。

当实例离开作用域 Rust 会自动调用 `drop`，并调用我们指定的代码。变量以被创建时相反的顺序被丢弃。

Rust 并不允许我们主动调用 `Drop` trait 的 `drop` 方法；当我们希望在作用域结束之前就强制释放变量的话，我们应该使用的是由标准库提供的 `std::mem::drop` 函数。

因为`std::mem::drop`参数为移动，所以所有权机制能确保资源不会被`double free`

## Rc<T> 引用计数智能指针

有些情况单个值可能会有多个所有者。例如，图。

为了启用多所有权需要显式地使用 Rust 类型 `Rc<T>`，其为**引用计数**（*reference counting*）的缩写。

注意 `Rc<T>` 只能用于单线程场景；

**共享数据**

创建两个共享第三个列表所有权的列表。

![image-20250527230044740](/img/rust%E5%AD%A6%E4%B9%A0/image-20250527230044740.webp)

当然Box不适合于这种情况。

可以改变 `Cons` 的定义来存放一个引用，不过接着必须指定生命周期参数。通过指定生命周期参数，表明列表中的每一个元素都至少与列表本身存在的一样久。

使用Rc更会合理

```rust
enum List {     Cons(i32, Rc<List>),     Nil, }  use crate::List::{Cons, Nil};
use std::rc::Rc;
fn main() {     let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
let b = Cons(3, Rc::clone(&a));
let c = Cons(4, Rc::clone(&a));
}
```


在这里 Rust 的习惯是使用 `Rc::clone`。

克隆Rc会增加引用计数。

引用计数的值可以通过调用 `Rc::strong_count` 获取，而不是`count`引用Rc中也有`weak_count`

通过不可变引用， `Rc<T>` 允许在程序的多个部分之间只读地共享数据。

## RefCell<T>和内部可变性

**内部可变性**（*Interior mutability*）是 Rust 中的一个设计模式，它允许你即使在有不可变引用时也可以改变数据，这通常是借用规则所不允许的。为了改变数据，该模式在数据结构中使用 `unsafe` 代码来模糊 Rust 通常的可变性和借用规则。不安全代码表明我们在手动检查这些规则而不是让编译器替我们检查。

当可以确保代码在运行时会遵守借用规则，即使编译器不能保证的情况，可以选择使用那些运用内部可变性模式的类型。所涉及的 `unsafe` 代码将被封装进安全的 API 中，而外部类型仍然是不可变的。

**通过RefCell<T> 在运行时强制借用规则**

`RefCell<T>` 代表其数据的唯一的所有权。

与`Box<T>`区别在于：

引用和`Box<T>`的借用规则的不变性在编译期间执行.

而`RefCell<T>`则是在运行期间执行, 在不符合规则的时候 panic.

编译器检查是最好的，对性能没有影响。但是他是保守的，有些情况下，某些程序不可能完成。

与`Rc<T>`一样`RefCell<T>`也只允许单线程。

* `Rc<T>` 允许相同数据有多个所有者；`Box<T>` 和 `RefCell<T>` 则只有单一所有者。
* `Box<T>` 允许在编译时执行不可变或可变借用检查；`Rc<T>` 仅允许在编译时执行不可变借用检查；`RefCell<T>` 允许在运行时执行不可变或可变借用检查。
* 因为 `RefCell<T>` 允许在运行时执行可变借用检查，所以我们可以在即便 `RefCell<T>` 自身是不可变的情况下修改其内部的值。

在不可变值内部改变值就是**内部可变性**（*interior mutability*）模式。

**内部可变性：不可变值的可变引用**

```rust
fn main() {     let x = 5;
let y = &mut x;
} // 不可编译
```


特定情况下，令一个值在其方法内部能够修改自身，而在其他代码中仍视为不可变，是很有用的。值方法外部的代码就不能修改其值了。`RefCell<T>` 是一个获得内部可变性的方法。

`RefCell<T>` 并没有完全绕开借用规则，编译器中的借用检查器允许内部可变性并相应地在运行时检查借用规则。如果违反了这些规则，会出现 panic 而不是编译错误。

**内部可变性用例：mock 对象**

**mock 对象** 是特定类型的测试替身，它们记录测试过程中发生了什么以便可以断言操作是正确的。

而在这些测试中，常常需要修改本身，然而接口是不可变引用，当然不可能为了一个测试去修改函数的接口。这个时候需要内部可变性来处理这个事情。

**RefCell<T>在运行时记录借用**

当创建不可变和可变引用时，我们分别使用 `&` 和 `&mut` 语法。对于 `RefCell<T>` 来说，则是 `borrow` 和 `borrow_mut` 方法，这属于 `RefCell<T>` 安全 API 的一部分。`borrow` 方法返回 `Ref<T>` 类型的智能指针，`borrow_mut` 方法返回 `RefMut<T>` 类型的智能指针。这两个类型都实现了 `Deref`，所以可以当作常规引用对待。

`RefCell<T>` 记录当前有多少个活动的 `Ref<T>` 和 `RefMut<T>` 智能指针。每次调用 `borrow`，`RefCell<T>` 将活动的不可变借用计数加一。当 `Ref<T>` 值离开作用域时，不可变借用计数减一。就像编译时借用规则一样，`RefCell<T>` 在任何时候只允许有多个不可变借用或一个可变借用。

如果违反这些规则，相比引用时的编译时错误，`RefCell<T>` 的实现会在运行时出现 panic。

**RefCell<T> 和 Rc<T>实现多个可变数据的所有者**

如果有一个储存了 `RefCell<T>` 的 `Rc<T>` 的话，就可以得到有多个所有者**并且**可以修改的值了！

之后通过`borrow_mut`获取可变引用。

当然，只允许同时存在一个。

**使用 Weak<T> 防止引用循环**

由于Rust不能防止循环引用导致的内存泄漏。

可以通过Weak来防止。

调用 `Rc::clone` 会增加 `Rc<T>` 实例的 `strong_count`，和只在其 `strong_count` 为 0 时 `Rc<T>` 实例才会被清理。

调用 `Rc::downgrade` 并传递 `Rc<T>` 实例的引用来创建其值的**弱引用**（*weak reference*）。

强引用代表如何共享 `Rc<T>` 实例的所有权；弱引用不表达所有权关系，当 `Rc<T>` 实例被清理时其计数没有影响。它们不会造成引用循环，因为任何涉及弱引用的循环会在其相关的值的强引用计数为 0 时被打断。

调用 `Rc::downgrade` 会将 `weak_count` 加 1。

例如，在树结构中，子节点希望拥有父节点的指针，但是同时父节点肯定有着子节点的指针。考虑到，父节点析构时，子节点也应该析构，那么子节点拥有的应该是父节点的Weak。

# 并发

## 使用线程

Rust 标准库使用 *1:1* 模型的线程实现，这代表程序的每一个语言级线程使用一个系统线程。有一些 crate 实现了其他有着不同于 1:1 模型取舍的线程模型。

**spawn 创建线程**

为了创建一个新线程，需要调用 `thread::spawn` 函数并传递一个闭包。

```rust
use std::thread;
use std::time::Duration;
fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }

    handle.join().unwrap(); // join 等待
}
```


**move 闭包与线程**

`move` 关键字经常用于传递给 `thread::spawn` 的闭包，因为闭包会获取从环境中取得的值的所有权，因此会将这些值的所有权从一个线程传送到另一个线程。

## 消息传递

为了实现消息传递并发，Rust 标准库提供了一个**信道**（*channel*）实现。

信道是一个通用编程概念，表示数据从一个线程发送到另一个线程。

当发送端或接收端任一被丢弃时可以认为信道被**关闭**（*closed*）了。

```rust
use std::sync::mpsc;
use std::thread;
fn main() {     let (tx, rx) = mpsc::channel();
thread::spawn(move || {         let val = String::from("hi");
tx.send(val).unwrap();
});
let received = rx.recv().unwrap();
println!("Got: {received}");
}
```


`mpsc::channel` 函数创建一个新的信道；`mpsc` 是 **多生产者，单消费者**（*multiple producer, single consumer*）的缩写。

那么显然，发送端拥有`clone`函数，可以创建多个发送者。

对信号使用`send`或`recv`的时候，返回`Result<T,E>`。

当然也有一个`try_recv`不会阻塞的函数，也会返回`Result<T,E>`

所有权对于信道的处理，可以比较方便的杜绝一些多线程并发问题。

如下：发送端发送多个信息。

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    // 类似于 Go 的语法糖
    for received in rx {
        println!("Got: {received}");
    }
}
```


## 共享状态的并发

**使用互斥器mutex互斥**

也就是互斥锁`mutex<T>`，同一时间只有一个线程能够访问。

**Mutex<T> 的API**

```rust
use std::sync::Mutex;
fn main() {     let m = Mutex::new(5);
{         let mut num = m.lock().unwrap();
*num = 6;
}      println!("m = {m:?}");
}
```


`Mutex<T>` 是一个智能指针。更准确的说，`lock` 调用会**返回**一个叫做 `MutexGuard` 的智能指针。

`MutexGuard` 智能指针实现了 `Deref` 来指向其内部数据；它也实现了 `Drop`，当 `MutexGuard` 离开作用域时，自动释放锁.

但是锁在多线程会因为move而无法共享。

即使使用`Rc<T>`也不行，因为它不能多线程安全

**原子引用计数 Arc<T>**

`Arc<T>` 正是这么一个类似 `Rc<T>` 并可以安全地用于并发环境的类型。

```rust
use std::sync::{Arc, Mutex};
use std::thread;
fn main() {     let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];
for _ in 0..10 {         let counter = Arc::clone(&counter);
let handle = thread::spawn(move || {             let mut num = counter.lock().unwrap();
*num += 1;
});
handles.push(handle);
}      for handle in handles {         handle.join().unwrap();
}      println!("Result: {}", *counter.lock().unwrap());
}
```


**RefCell/Rc与Mutex/Arc的相似性**

分别是各自的多线程安全版本。

## Send 和 Sync trait

`Send` 标记 trait 表明实现了 `Send` 的类型值的所有权可以在线程间传送。任何完全由 `Send` 的类型组成的类型也会自动被标记为 `Send`。几乎所有基本类型都是 `Send` 的。除了裸指针(raw pointer)。

`Sync` 标记 trait 表明一个实现了 `Sync` 的类型可以安全的在多个线程中拥有其值的引用。

换一种方式来说，对于任意类型 `T`，如果 `&T`（`T` 的不可变引用）实现了 `Send` 的话 `T` 就实现了 `Sync`，这意味着其引用就可以安全的发送到另一个线程。类似于 `Send` 的情况，基本类型都实现了 `Sync`，完全由实现了 `Sync` 的类型组成的类型也实现了 `Sync`。

**手动实现 Send 和 Sync 是不安全的**

通常并不需要手动实现 `Send` 和 `Sync` trait，因为完全由实现了 `Send` 和 `Sync` 的类型组成的类型，自动实现了 `Send` 和 `Sync`。因为它们是标记 trait，甚至都不需要实现任何方法。它们只是用来加强并发相关的不可变性的。

手动实现这些标记 trait 涉及到编写不安全的 Rust 代码。

# Async 和 await

ust 异步编程的关键元素是 *futures* 和 Rust 的 `async` 与 `await` 关键字。

*future* 是一个现在可能还没有准备好但将在未来某个时刻准备好的值。

Rust 提供了 `Future` trait 作为基础组件，这样不同的异步操作就可以在不同的数据结构上实现。在 Rust 中，我们称实现了 `Future` trait 的类型为 futures。每一个实现了 `Future` 的类型会维护自己的进度状态信息和 “ready” 的定义。

`async` 关键字可以用于代码块和函数，表明它们可以被中断并恢复。

使用 `async` 和 `await` 关键字等同于使用 `Future` trait 的代码。

Rust 遇到一个 `async` 关键字标记的代码块时，会将其编译为一个实现了 `Future` trait 的唯一的、匿名的数据类型。

当 Rust 遇到一个被标记为 `async` 的函数时，会将其编译进一个拥有异步代码块的非异步函数。异步函数的返回值类型是编译器为异步代码块所创建的匿名数据类型。

编写 `async fn` 就等同于编写一个返回类型的 *future* 的函数。

`await`只允许在`async fn`或者`async block`中使用，main函数不可以标记为async。

`main` 不能标记为 `async` 的原因是异步代码需要一个 *运行时*：即一个管理执行异步代码细节的 Rust crate。一个程序的 `main` 函数可以 *初始化* 一个运行时，但是其 *自身* 并不是一个运行时。每一个执行异步代码的 Rust 程序必须至少有一个设置运行时并执行 futures 的地方。

```rust
fn page_title(url: &str) -> impl Future<Output = Option<String>> + '_ {
    async move {
        let text = trpl::get(url).await.text().await;
        Html::parse(&text)
            .select_first("title")
            .map(|title| title.inner_html())
    }
}
```


函数返回的 `Future` 指向一个引用（在这个例子中是指向 `url` 参数的引用）我们需要告诉 Rust 引用的生命周期。这里无需命名该生命周期，因为 Rust 足够智能到能理解这里只涉及到唯一一个引用，不过我们 *必须* 明确指出返回的 `Future` 受该生命周期的约束。

大部分支持异步的语言会打包一个运行时在语言中，Rust 则不是。相反，这里有很多不同的异步运行时，每一个都有适合其目标的权衡取舍。

想要异步地执行代码，必须有一个运行时(runtime)来执行，也就是有一个函数来调用future或者说异步代码块。

```rust
fn main() {
    let args: Vec<String> = std::env::args().collect();

    trpl::run(async {
        let url = &args[1];
        match page_title(url).await {
            Some(title) => println!("The title for {url} was {title}"),
            None => println!("{url} had no title"),
        }
    })
}
```


每一个 *await point*，也就是代码使用 `await` 关键字的地方，代表将控制权交还给运行时的地方。为此 Rust 需要记录异步代码块中涉及的状态，这样运行时可以去执行其他工作，并在准备好时回来继续推进当前的任务。

Rust 编译器自动创建并管理异步代码的状态机数据结构。

最终需要某个组件来执行状态机。这就是运行时。

异步块会返回一个future，将future提交之后，异步块执行。

至于提交之后是阻塞原来的任务还是异步执行，看具体实现。

## 并发与 async

与线程一样，在async之后，需要一个handler来处理。

比如：spawn\_task的一些接口，可以方便的来使用。

而await的效果则类似于join。自然一些库也提供了这种功能。

比如：

```rust
fn main() {
    trpl::run(async {
        let fut1 = async {
            for i in 1..10 {
                println!("hi number {i} from the first task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        let fut2 = async {
            for i in 1..5 {
                println!("hi number {i} from the second task!");
                trpl::sleep(Duration::from_millis(500)).await;
            }
        };

        trpl::join(fut1, fut2).await;
    });
}
```


由于`trpl::join`是公平的，因此它以相同的频率检查每一个 future，使它们交替执行。

**消息传递**

在 future 之间共享数据也与线程类似：我们会再次使用消息传递，不过这次使用的是异步版本的类型和函数。

比如：

```rust
fn main() {
    trpl::run(async {
        let (tx, mut rx) = trpl::channel();
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("future"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            trpl::sleep(Duration::from_millis(500)).await;
        }

        while let Some(value) = rx.recv().await {
            println!("received '{value}'");
        }
    });
}
```


`trpl::channel`，一个用于线程的多生产者、单消费者信道 API 的异步版本。

异步版本的 API 与基于线程的版本只有一点微小的区别：它使用一个可变的而不是不可变的 `rx`，并且它的 `recv` 方法产生一个需要 await 的 future 而不是直接返回值。

注意无需产生一个独立的线程或者任务；只需等待（await） `rx.recv` 调用。

`std::mpsc::channel` 中的同步 `Receiver::recv` 方法阻塞执行直到它接收一个消息。

`trpl::Receiver::recv` 则不会阻塞，因为它是异步的。

不同于阻塞，它将控制权交还给运行时，直到接收到一个消息或者信道的发送端关闭。

相比之下，我们不用 `await send`，因为它不会阻塞。也无需阻塞，因为信道的发送端的数量是没有限制的。

## 使用任意数量的 futures

join!和join\_all处理了futures未知数量时，等待的操作。

然而：

```rust
let futures = vec![tx1_fut, rx_fut, tx_fut];
trpl::join_all(futures).await; // 不可编译
```


每个代码块都会产生一个 `Future<Output = ()>`。

然而，`Future` 是一个 trait，而不是一个具体类型。

其具体类型是编译器为各个异步代码块生成的（不同的）数据结构。你不能将两个不同的手写的 struct 放进同一个 `Vec`，同样的原理也适用于编译器生成的不同 struct。

为了使代码能够正常工作，我们需要使用 *trait objects*，允许我们将这些类型所产生的不同的匿名 future 视为相同的类型，因为它们都实现了 `Future` trait。

修改方法是，使用Box::pin：

```rust
let futures: Vec<Pin<Box<dyn Future<Output = ()>>>> = vec![
    Box::pin(tx1_fut),
    Box::pin(rx_fut),
    Box::pin(tx_fut),
];
```


`Pin` 本身是一个封装类型，因此我们可以在 `Vec` 中拥有单一类型的好处。可以通过 `std::pin::pin` 宏来直接对每个 future 使用 `Pin`。

使用`pin!`将类型包装为trait object，同一类型。

比如：

```rust
extern
crate
trpl;
//
required
for
mdbook
test
use
std::pin::
{Pin, pin}
;
//
--
snip
--
use
std::time::Duration;
fn
main
()
{     trpl::run
(async
{         let
(tx, mut rx) = trpl::channel
();          let tx1 = tx.clone
();         let tx1_fut = pin!
(async move
{             // --snip--             let vals = vec![                 String::from
("hi"),                 String::from
("from"),                 String::from
("the"),                 String::from
("future"),             ];              for val in vals
{                 tx1.send
(val).unwrap
();                 trpl::sleep
(Duration::from_secs
(1)).await;             }         });          let rx_fut = pin!
(async
{             // --snip--             while let Some
(value) = rx.recv
().await
{                 println!
("received '{value}'");             }         });          let tx_fut = pin!
(async move
{             // --snip--             let vals = vec![                 String::from
("more"),                 String::from
("messages"),                 String::from
("for"),                 String::from
("you"),             ];              for val in vals
{                 tx.send
(val).unwrap
();                 trpl::sleep
(Duration::from_secs
(1)).await;             }         });          let futures: Vec<Pin<&mut dyn Future<Output =
()>>> =             vec![tx1_fut, rx_fut, tx_fut];          trpl::join_all
(futures).await;     }); }
```


**futures 竞争**

有时我们只需要 *部分* future 结束就能继续，这有点像一个 future 与另一个 future 竞争。

然而特定的 `race` 函数实现并不是公平的。它总是以传递的参数的顺序来运行传递的 futures。

其它的实现 *是* 公平的，并且会随机选择首先轮询的 future。

不过无论我们使用的 race 实现是否公平，其中 *一个* future 会在另一个任务开始之前一直运行到异步代码块中第一个 `await` 为止。

在每一个 await point，如果被 await 的 future 还没有就绪，Rust 会给运行时一个机会来暂停该任务并切换到另一个任务。反过来也是正确的：Rust *只会* 在一个 await point 暂停异步代码块并将控制权交还给运行时。

**await points 之间的一切都是同步。**

如果你在异步代码块中做了一堆工作而没有一个 await point，则那个 future 会阻塞其它任何 future 继续进行。

这个时候，可能需要考虑何时将控制权转移。

**Yielding**

当进行缓慢且会阻塞的操作的时候，需要考虑控制权的转移，并且需要考虑控制权怎么转移。

显然，使用sleep的愚蠢的。

正确方法是使用 yield：

```rust
let a = async {     println!("'a' started.");
slow("a", 30);
trpl::yield_now().await;
slow("a", 10);
trpl::yield_now().await;
slow("a", 20);
trpl::yield_now().await;
println!("'a' finished.");
};
let b = async {     println!("'b' started.");
slow("b", 75);
trpl::yield_now().await;
slow("b", 10);
trpl::yield_now().await;
slow("b", 15);
trpl::yield_now().await;
slow("b", 350);
trpl::yield_now().await;
println!("'b' finished.");
};
```


异步操作甚至在计算密集型任务中也有用处，因为它提供了一个结构化程序中不同部分之间关系的实用工具。

这是一种形式的 *协同多任务处理*（*cooperative multitasking*），每个 futrue 有权通过 await point 来决定何时交还控制权。

## 流（Streams）：顺序的 Futures

流类似于一种异步形式的迭代器。不过鉴于 `trpl::Receiver` 专门等待接收消息，多用途的流 API 则更为通用：它像 `Iterator` 一样提供了下一个项，但采用异步的方式。

Rust 中迭代器和流的相似性意味着我们实际上可以从任何迭代器上创建流。

但是对一个迭代器来说，必须实现类似于`Stream`的trait才可以调用，这个trait是`StreamExt`其中`Ext`表示拓展，是用一个`trait`拓展另一个`trait`的方法。

```rust
use trpl::StreamExt;
fn main() {     trpl::run(async {         let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let iter = values.iter().map(|n| n * 2);
let mut stream = trpl::stream_from_iter(iter);
while let Some(value) = stream.next().await {             println!("The value was: {value}");
}     });
}
```


**与async有关的traits**

**Future trait**

```rust
use std::pin::Pin;
use std::task::{Context, Poll};
pub trait Future {
    type Output;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}

enum Poll<T> {
    Ready(T),
    Pending,
}
```


首先， `Future` 的关联类型 `Output` 表明 future 最终解析出的类型。这类似于 `Iterator` trait 的关联类型 `Item`。其次，`Future` 还有一个 `poll` 方法，其有一个特殊的 `self` 参数的 `Pin` 引用和一个 `Context` 类型的可变引用，并返回一个 `Poll<Self::Output>`。

`Poll` 类型类似于一个 `Option`。它有一个包含值的变体 `Ready(T)`，和一个没有值的变体 `Pending`。不过 `Poll` 所代表的意义与 `Option` 非常不同！`Pending` 变体表明 future 仍然还有工作要进行，所有调用者稍后需要再次检查。`Ready` 变体表明 future 已经完成了其工作并且 `T` 的值是可用的。

对于大部分功能，调用者不应在 future 返回 `Ready` 后再次调用 `poll`。很多 future 在完成后再次轮询会 panic。可以安全地再次轮询的 future 会在文档中显式地说明。这类似于 `Iterator::next` 的行为。

使用 `await` 的代码时，Rust 会在底层将其编译为调用 `poll` 的代码。

future 的基本机制：运行时**轮询**其所负责的每一个 future，在它们还没有完成时使其休眠。

**Pin 和 Unpin traits**

`trpl::join_all` 函数返回一个叫做 `JoinAll` 的结构体。这个结构体是一个 `F` 类型的泛型，它被限制为需要实现 `Future` trait。通过 `await` 直接 await 一个 future 会隐式地 pin 住这个函数。这也就是为什么我们不需要在任何想要 await future 的地方使用 `pin!`。

`Pin` 是一个类指针类型的封装，比如 `&`，`&mut`，`Box` 和 `Rc`。（从技术上来说，`Pin` 适用于实现了 `Deref` 或 `DerefMut` trait 的类型，不过这实际上等同于只能适用于指针。）`Pin` 本身并不是一个指针并且也不具备类似 `Rc` 和 `Arc` 那样引用技术的功能；它单纯地是一个编译器可以用来约束指针使用的工具。

通过 `Pin` 封装一个值的引用来 **pin** 住它时，它就无法再移动了。也就是说，如果有 `Pin<Box<SomeType>>`，你实际上 pin 住了 `SomeType` 的值，而**不是** `Box` 指针。

默认情况下移动任何拥有其自身引用的对象是不安全（unsafe）的，因为引用总是会指向任何其引用数据的实际内存地址。如果我们移动数据结构本身，这些内部引用会停留在指向老的地址。其关键在于自引用类型本身不可移动，因为它仍然是被 pin 住的。

而`Pin`就是相当于阻止一个对象移动。

大多数类型即使被封装在 `Pin` 后面，也完全可以安全地移动。只有当项中含有内部引用的时候才需要考虑 pin。

但是有些情况下，比如:`Pin<Vec<String>>>`你明知它可以安全移动，但是却只能通过`Pin`的接口来进行操作。

因此在一些情况下，需要告诉编译器，移动是可行的，这就是`Unpin trait`

`Unpin` 是一个标记 trait（marker trait），类似于 `Send` 和 `Sync` trait，因此它们自身没有功能。标记 trait 的存在只是为了告诉编译器在给定上下文中可以安全地使用实现了给定 trait 的类型。`Unpin` 告知编译器这个给定类型**无需**维护被提及的值是否可以安全地移动的任何保证。编译器自动为所有被证明为安全的类型实现 `Unpin`。

首先，`Unpin` 用于 “正常” 情况，而 `!Unpin` 用于特殊情况。

其次，一个类型是否实现了 `Unpin` 或 `!Unpin` **只在于**你是否使用了一个被 pin 住的指向类似 `Pin<&mut *SomeType*>` 类型的指针。

`!Unpin`就是指没有实现`Unpin`的类型，当然就可以`Pin`了。

如果实现了`Unpin`那么实际上类型并不会被`Pin`住。

`Pin` 与 `Unpin` 的组合使得可以安全地实现在 Rust 中原本因自引用而难以实现的一整类复杂类型。

**Stream trait**

```rust
use std::pin::Pin;
use std::task::{Context, Poll};
trait Stream {     type Item;
fn poll_next(         self: Pin<&mut Self>,         cx: &mut Context<'_>     ) -> Poll<Option<Self::Item>>; }
```


`Stream` trait 定义了一个名为 `Item` 的关联类型来作为流所产生项的类型。这类似于 `Iterator`，其中可能含有零个到多个项，而有别于 `Future`，后者总是只有一个 `Output`，即使它是 unit 类型 `()`。

`Stream` 也定义了一个获取这些项的方法。名为 `poll_next`，来明确它以 `Future::poll` 同样的方式轮询并以 `Iterator::next` 同样的方式产生一系列的项。其返回类型用 `Option` 组合了 `Poll`。外部类型是 `Poll`，因为它必须检查可用性，就像 future 一样。内部类型是 `Option`，因为它需要表明是否有更多消息，就像迭代器一样。

`StreamExt` 自动为所有实现了 `Stream` 的方法实现，不过这些 trait 是分别定义的以便社区可以迭代便利的工具而不会影响基础 trait。

该 trait 不仅定义了 `next` 方法而且提供了一个正确处理 `Stream::poll_next` 细节的 `next` 方法默认实现。这意味着即便当你编写自己的流数据类型时，**只需**实现 `Stream`，接着任何使用你数据类型的人就自动地可以使用 `StreamExt` 及其方法。

# OOP

**对象包含数据与行为**

面向对象的程序由对象组成。一个**对象**包含数据和操作这些数据的过程。这些过程通常被称为**方法** 或**操作**。

**封装**

通过模块控制pub和在结构体上实现方法的形式，Rust可以实现类似于对象的封装的概念。

**多态**

Rust 使用泛型来抽象不同可能的类型，并通过 trait bound 来约束这些类型所必须提供的内容。这有时被称为 *bounded parametric polymorphism*。有界参数多态。

**继承**

通过类型中内置其他类型和trait默认实现，可以实现类似继承的东西。

至于父类的public、private和protected，则不能完全模拟

继承则是OOP主要被攻击的点。

## 不同类型的 trait 对象

trait 对象指向一个实现了我们指定 trait 的类型的实例，以及一个用于在运行时查找该类型的 trait 方法的表。

我们通过指定某种指针来创建 trait 对象，例如 `&` 引用或 `Box<T>` 智能指针，还有 `dyn` 关键字，以及指定相关的 trait。

使用 trait 对象代替泛型或具体类型。任何使用 trait 对象的位置，Rust 的类型系统会在编译时确保任何在此上下文中使用的值会实现其 trait 对象的 trait。如此便无需在编译时就知晓所有可能的类型。

这个概念 —— 只关心值所反映的信息而不是其具体类型 —— 类似于动态类型语言中称为**鸭子类型**（*duck typing*）的概念：如果它走起来像一只鸭子，叫起来像一只鸭子，那么它就是一只鸭子！

使用 trait 对象和 Rust 类型系统来进行类似鸭子类型操作的优势是无需在运行时检查一个值是否实现了特定方法或者担心在调用时因为值没有实现方法而产生错误。如果值没有实现 trait 对象所需的 trait 则 Rust 不会编译这些代码。

```rust
pub trait Draw {
    fn draw(&self);
}

pub struct Button {
    pub width: u32,
    pub height: u32,
    pub label: String,
}

impl Draw for Button {
    fn draw(&self) {
        // code to actually draw a button
    }
}

struct SelectBox {
    width: u32,
    height: u32,
    options: Vec<String>,
}

impl Draw for SelectBox {
    fn draw(&self) {
        // code to actually draw a select box
    }
}

pub struct Screen {
    pub components: Vec<Box<dyn Draw>>, // 动态
}

impl Screen {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}

fn main() {
    let screen = Screen {
        components: vec![
            Box::new(SelectBox {
                width: 75,
                height: 10,
                options: vec![
                    String::from("Yes"),
                    String::from("Maybe"),
                    String::from("No"),
                ],
            }),
            Box::new(Button {
                width: 50,
                height: 10,
                label: String::from("OK"),
            }),
        ],
    };

    screen.run();
}
```


通过`dyn`关键字+`trait`的方式来声明一个`trait`对象。

**trait 对象执行动态分发**

当对泛型使用 trait bound 时编译器所执行的单态化处理：编译器为每一个被泛型类型参数代替的具体类型生成了函数和方法的非泛型实现。单态化产生的代码在执行**静态分发**（*static dispatch*），也就是说编译器在编译时就知晓要调用什么方法。这与**动态分发** （*dynamic dispatch*）相对，这时编译器在编译时无法知晓要调用哪个方法。在动态分发的场景下，编译器会生成负责在运行时确定该调用什么方法的代码。

当使用 trait 对象时，Rust 必须使用动态分发。编译器无法知晓所有可能用于 trait 对象代码的类型，所以它也不知道应该调用哪个类型的哪个方法实现。为此，Rust 在运行时使用 trait 对象中的指针来知晓需要调用哪个方法。

这种查找会带来在静态分发中不会产生的运行时开销。动态分发也阻止编译器有选择地内联方法代码，这会相应地禁用一些优化，Rust 还定义了一些规则，称为**dyn 兼容性**（*dyn compatibility*），用于规定可以和不可以在哪些地方使用动态分发。

`trait`对象包含两个指针，一个指针是指向原来数据结构体的指针，一个是指向该`trait`中的方法表的函数指针。

下面是`dyn`关键字的注释：

---

`dyn` is a prefix of a [trait object](vscode-file://vscode-app/d:/Users/86131/AppData/Microsoft VS Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)'s type.

The `dyn` keyword is used to highlight that calls to methods on the associated `Trait` are [dynamically dispatched](vscode-file://vscode-app/d:/Users/86131/AppData/Microsoft VS Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html). To use the trait this way, it must be *dyn compatible*[[1]](#fn1).

Unlike generic parameters or `impl Trait`, the compiler does not know the concrete type that is being passed. That is, the type has been [erased](vscode-file://vscode-app/d:/Users/86131/AppData/Microsoft VS Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html). As such, a `dyn Trait` reference contains *two* pointers. One pointer goes to the data (e.g., an instance of a struct). Another pointer goes to a map of method call names to function pointers (known as a virtual method table or vtable).

At run-time, when a method needs to be called on the `dyn Trait`, the vtable is consulted to get the function pointer and then that function pointer is called.

See the Reference for more information on [trait objects](vscode-file://vscode-app/d:/Users/86131/AppData/Microsoft VS Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) and [dyn compatibility](vscode-file://vscode-app/d:/Users/86131/AppData/Microsoft VS Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

**Trade-offs**

The above indirection is the additional runtime cost of calling a function on a `dyn Trait`. Methods called by dynamic dispatch generally cannot be inlined by the compiler.

However, `dyn Trait` is likely to produce smaller code than `impl Trait` / generic parameters as the method won't be duplicated for each concrete type.

# 模式与模式匹配

**模式**（*Patterns*）是 Rust 中一种特殊的语法，它用来匹配类型的结构，无论类型是简单还是复杂。结合使用模式和 `match` 表达式以及其他结构可以提供更多对程序控制流的支配权。模式由如下一些内容组合而成：

* 字面值
* 已解构的数组、枚举、结构体或者元组
* 变量
* 通配符
* 占位符

## 所有可能出现模式的地方

**match 分支**

```
match
VALUE
{     PATTERN => EXPRESSION,     PATTERN => EXPRESSION,     PATTERN => EXPRESSION, }
```


`match` 表达式的一个要求是它们必须**穷尽**（*exhaustive*）的，意为 `match` 表达式所有可能的值都必须被考虑到。

**if let 条件表达式**

`if let` 表达式主要用于编写等同于只关心一个情况的 `match` 语句简写的。

`if let` 可以对应一个可选的带有代码的 `else` 在 `if let` 中的模式不匹配时运行。

可以组合并匹配 `if let`、`else if` 和 `else if let` 表达式。

```rust
fn main() {     let favorite_color: Option<&str> = None;
let is_tuesday = false;
let age: Result<u8, _> = "34".parse();
if let Some(color) = favorite_color {         println!("Using your favorite color, {color}, as the background");
} else if is_tuesday {         println!("Tuesday is green day!");
} else if let Ok(age) = age {         if age > 30 {             println!("Using purple as the background color");
} else {             println!("Using orange as the background color");
}     } else {         println!("Using blue as the background color");
} }
```


**while let 条件循环**

`while let` 条件循环，它允许只要模式匹配就一直进行 `while` 循环。

```rust
fn main() {     let (tx, rx) = std::sync::mpsc::channel();
std::thread::spawn(move || {         for val in [1, 2, 3] {             tx.send(val).unwrap();
}     });
while let Ok(value) = rx.recv() {         println!("{value}");
} }
```


**for 循环**

在 `for` 循环中，模式是 `for` 关键字直接跟随的值。例如，在 `for x in y` 中，`x` 就是这个模式。

示例展示了如何使用 `for` 循环来解构，或拆开一个元组作为 `for` 循环的一部分：

```rust
fn main() {     let v = vec!['a', 'b', 'c'];
for (index, value) in v.iter().enumerate() {         println!("{value} is at index {index}");
} }
```
**let
语句**
```rust
let PATTERN = EXPRESSION;
let x = 5;
let (x, y, z) = (1, 2, 3);
```


像 `let x = 5;` 这样的语句中变量名位于 `PATTERN` 位置，变量名不过是形式特别朴素的模式。我们将表达式与模式比较，并为任何找到的名称赋值。所以例如 `let x = 5;` 的情况，`x` 是一个代表 “将匹配到的值绑定到变量 x” 的模式。同时因为名称 `x` 是整个模式，这个模式实际上等于 “将任何值绑定到变量 `x`，不管值是什么”。

**函数参数**

```rust
fn foo(x: i32) {}
// x 部分就是一个模式！类似于之前对 let 所做的，可以在函数参数中匹配元组。
fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("Current location: ({x}, {y})");
}
// 值 &(3, 5) 会匹配模式 &(x, y)
```


闭包类似于函数，也可以在闭包参数列表中使用模式。

## Refutability（可反驳性）：模式是否会匹配失效

模式有两种形式：refutable（可反驳的）和 irrefutable（不可反驳的）。能匹配任何传递的可能值的模式被称为是**不可反驳的**（*irrefutable*）。一个例子就是 `let x = 5;` 语句中的 `x`，因为 `x` 可以匹配任何值所以不可能会失败。对某些可能的值进行匹配会失败的模式被称为是**可反驳的**（*refutable*）。一个这样的例子便是 `if let Some(x) = a_value` 表达式中的 `Some(x)`；如果变量 `a_value` 中的值是 `None` 而不是 `Some`，那么 `Some(x)` 模式不能匹配。

函数参数、`let` 语句和 `for` 循环只能接受不可反驳的模式，因为当值不匹配时，程序无法进行有意义的操作。

`if let` 和 `while let` 表达式可以接受可反驳和不可反驳的模式，但编译器会对不可反驳的模式发出警告，因为根据定义它们旨在处理可能的失败：条件表达式的功能在于它能够根据成功或失败来执行不同的操作。

如：

```rust
let
Some
(x)
=
some_option_value;
```


如果 `some_option_value` 的值是 `None`，其不会成功匹配模式 `Some(x)`，表明这个模式是可反驳的。然而，因为 `let` 对于 `None` 匹配不能产生任何合法的代码，所以 `let` 语句只能接受不可反驳模式。

然如果给 `if let` 提供一个不可反驳模式（即总会匹配的模式），编译器就会给出警告：

```rust
let x = 5 else {     return;
};
```


将不可反驳模式用于 `if let` 是没有意义的

基于此，`match` 匹配分支必须使用可反驳模式，除了最后一个分支需要使用能匹配任何剩余值的不可反驳模式。Rust 允许我们在只有一个匹配分支的`match` 中使用不可反驳模式，不过这么做不是特别有用，并可以被更简单的 `let` 语句替代。

## 所有有效的模式语法

**匹配字面量**

```rust
let x = 1;
match x {
    1 => println!("one"),
    2 => println!("two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```


用于匹配特定值。

**匹配命名变量**

命名变量是匹配任何值的不可反驳模式。

然而，当在 `match`、`if let` 或 `while let` 表达式中使用命名变量时，会出现一些复杂情况。由于这些表达式会开始一个新作用域，作为模式一部分在表达式内部声明的变量会遮蔽外部同名变量，这与所有变量的遮蔽规则一致。

```rust
fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(y) => println!("Matched, y = {y}"),
        _ => println!("Default case, x = {x:?}"),
    }

    println!("at the end: x = {x:?}, y = {y}");
}
```
运行结果：
```
Matched, y = 5
at the end: x = Some(5), y = 10
```


**多个模式**

在 `match` 表达式中，可以使用 `|` 语法匹配多个模式，它代表 **或**（*or*）运算符模式。

```rust
let x = 1;
match x {     1 | 2 => println!("one or two"),     3 => println!("three"),     _ => println!("anything"), }
```


**通过 ..= 匹配值范围**

`..=` 语法允许你匹配一个闭区间范围（range）内的值。

```rust
let x = 5;
match x {     1..=5 => println!("one through five"),     _ => println!("something else"), }
```


编译器会在编译时检查范围不为空，而 `char` 和数字值是 Rust 仅有的可以判断范围是否为空的类型，所以范围只允许用于数字或 `char` 值。

```rust
let x = 'c';
match x {
    'a'..='j' => println!("early ASCII letter"),
    'k'..='z' => println!("late ASCII letter"),
    _ => println!("something else"),
}
```


**解构结构体**

通过带有模式的 `let` 语句将其分解：

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };
    let Point { x: a, y: b } = p;
    assert_eq!(0, a);
    assert_eq!(7, b);
}
```


因为变量名匹配字段名是常见的，同时因为 `let Point { x: x, y: y } = p;` 包含了很多重复，所以对于匹配结构体字段的模式存在简写：只需列出结构体字段的名称，则模式创建的变量会有相同的名称。

比如：

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };
    let Point { x, y } = p;
    assert_eq!(0, x);
    assert_eq!(7, y);
}
```
可以使用字面值作为结构体模式的一部分进行解构，而不是为所有的字段创建变量。这允许我们测试一些字段为特定值的同时创建其他字段的变量。
```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    match p {
        Point { x, y: 0 } => println!("On the x axis at {x}"),
        Point { x: 0, y } => println!("On the y axis at {y}"),
        Point { x, y } => {
            println!("On neither axis: ({x}, {y})");
        }
    }
}
```


但是另一方面，相当于p在匹配 `Point {x, y:0}` 如果想要只关心x，y的话，则不能使用这种匹配方法。

**解构枚举**

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let msg = Message::ChangeColor(0, 160, 255);

    match msg {
        Message::Quit => {
            println!("The Quit variant has no data to destructure.");
        }
        Message::Move { x, y } => {
            println!("Move in the x direction {x} and in the y direction {y}");
        }
        Message::Write(text) => {
            println!("Text message: {text}");
        }
        Message::ChangeColor(r, g, b) => {
            println!("Change color to red {r}, green {g}, and blue {b}");
        }
    }
}
```
**结构嵌套结构体和枚举**
```rust
enum Color {
    Rgb(i32, i32, i32),
    Hsv(i32, i32, i32),
}

enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(Color),
}

fn main() {
    let msg = Message::ChangeColor(Color::Hsv(0, 160, 255));

    match msg {
        Message::ChangeColor(Color::Rgb(r, g, b)) => {
            println!("Change color to red {r}, green {g}, and blue {b}");
        }
        Message::ChangeColor(Color::Hsv(h, s, v)) => {
            println!("Change color to hue {h}, saturation {s}, value {v}");
        }
        _ => (),
    }
}
```
**解构结构体和元组**

```rust
let ((feet, inches), Point { x, y }) = ((3, 10), Point { x: 3, y: -10 });
```


通过复杂的方式进行混合

**用 \_ 忽略整个值**

```rust
fn foo(_: i32, y: i32) {
    println!("This code only uses the y parameter: {y}");
}

fn main() {
    foo(3, 4);
}
```


这段代码会完全忽略作为第一个参数传递的值 `3`，并会打印出 `This code only uses the y parameter: 4`。

但是在实现trait的时候可能会有用。

**使用嵌套的 \_ 忽略部分值**

```rust
let mut setting_value = Some(5);
let new_setting_value = Some(10);
match (setting_value, new_setting_value) {
    (Some(_), Some(_)) => {
        println!("Can't overwrite an existing customized value");
    }
    _ => {
        setting_value = new_setting_value;
    }
}
println!("setting is {setting_value:?}");
```


不需要匹配或使用任一个 `Some` 变体中的值，但需要检测 `setting_value` 和 `new_setting_value` 是否均为 `Some` 变体。在这种情况下，我们打印出为何不改变 `setting_value`，并且不会改变它。

也可以在一个模式中的多处使用下划线来忽略特定值，这里忽略了一个五元元组中的第二和第四个值：

```rust
let numbers = (2, 4, 8, 16, 32);
match numbers {
    (first, _, third, _, fifth) => {
        println!("Some numbers: {first}, {third}, {fifth}");
    }
}
```
**在变量名开头加
\_
来忽略未使用变量**
```rust
fn main() {
    let _x = 5;
    let y = 10;
}
```


这样可以避免Rust警告

注意，只使用 `_` 和使用以下划线开头的名称有些微妙的不同：比如 `_x` 仍会将值绑定到变量，而 `_` 则完全不会绑定。

```rust
let s = Some(String::from("Hello!"));
if let Some(_s) = s {
    println!("found a string");
}
// 不可编译
println!("{s:?}");
```


以下划线开头的未使用变量仍然会绑定值，它可能会获取值的所有权

因为 `s` 的值仍然会移动进 `_s`，并阻止我们再次使用 `s`。然而只使用下划线本身，并不会绑定值。

**用 .. 忽略剩余值**

`..` 模式会忽略模式中剩余的任何没有显式匹配的值部分。

比如：

```rust
struct Point {
    x: i32,
    y: i32,
    z: i32,
}

let origin = Point { x: 0, y: 0, z: 0 };
match origin {
    Point { x, .. } => println!("x is {x}"),
}
```
或者
```rust
fn main() {
    let numbers = (2, 4, 8, 16, 32);
    match numbers {
        (first, .., last) => {
            println!("Some numbers: {first}, {last}");
        }
    }
}
```


但是`..`必须没有歧义。

```rust
fn main() {
    let numbers = (2, 4, 8, 16, 32);
    match numbers {
        (.., second, ..) => {
            println!("Some numbers: {second}")
        }
    }
    // 不可编译，因为 second 不知道绑定到哪里。
}
```


**匹配守卫**

**匹配守卫**（*match guard*）是一个指定于 `match` 分支模式之后的额外 `if` 条件，它也必须被满足才能选择此分支。匹配守卫用于表达比单独的模式所能允许的更为复杂的情况。但是注意，它们仅在 `match` 表达式中可用，不能用于 `if let` 或 `while let` 表达式。

```rust
let num = Some(4);
match num {
    Some(x) if x % 2 == 0 => println!("The number {x} is even"),
    Some(x) => println!("The number {x} is odd"),
    None => (),
}
```


无法在模式中表达类似 `if x % 2 == 0` 的条件，所以通过匹配守卫提供了表达类似逻辑的能力。这种替代表达方式的缺点是，编译器不会尝试为包含匹配守卫的模式检查穷尽性。

可以使用匹配守卫来解决模式中变量遮蔽的问题，那里 `match` 表达式的模式中新建了一个变量而不是使用 `match` 之外的同名变量。新变量意味着不能够测试外部变量的值。

```rust
fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(n) if n == y => println!("Matched, n = {n}"),
        _ => println!("Default case, x = {x:?}"),
    }

    println!("at the end: x = {x:?}, y = {y}");
}
```


这个例子使用外部的y来进行检查，而不是新建一个变量y。

也可以在匹配守卫中使用**或**运算符 `|` 来指定多个模式，同时匹配守卫的条件会作用于所有的模式。

```rust
let x = 4;
let y = false;
match x {
    4 | 5 | 6 if y => println!("yes"),
    _ => println!("no"),
}
```


其优先级为：

`(4 | 5 | 6) if y => ...`而不是`4 | 5 | (6 if y) => ...`

**@ 绑定**

*at* 运算符（`@`）允许我们在创建一个存放值的变量的同时测试其值是否匹配模式。

```rust
enum Message {
    Hello { id: i32 },
}

let msg = Message::Hello { id: 5 };
match msg {
    Message::Hello {
        id: id_variable @ 3..=7,
    } => println!("Found an id in range: {id_variable}"),
    Message::Hello { id: 10..=12 } => {
        println!("Found an id in another range")
    }
    Message::Hello { id } => println!("Found some other id: {id}"),
}
```


使用 `@` 可以在一个模式中同时测试和保存变量值。

`@`不止可以用在match中

# 高级特性

本章将涉及如下内容：

* 不安全 Rust：用于当需要舍弃 Rust 的某些保证并负责手动维持这些保证
* 高级 trait：与 trait 相关的关联类型，默认类型参数，完全限定语法（fully qualified syntax），超（父）trait（supertraits）模式 newtype 模式
* 高级类型：关于 newtype 模式的更多内容，类型别名，never 类型和动态大小类型
* 高级函数和闭包：函数指针和返回闭包
* 宏：定义在编译时定义更多代码的方式

## 不安全 Rust

Rust 还隐藏有第二种语言，它不会强制执行这类内存安全保证：这被称为 **不安全 Rust**（*unsafe Rust*）。它与常规 Rust 代码无异，但是会提供额外的超能力。

这里有五类可以在不安全 Rust 中进行而不能用于安全 Rust 的操作，它们称之为**不安全的超能力**（**unsafe superpowers**）。这些超能力包括：

* 解引用裸指针
* 调用不安全的函数或方法
* 访问或修改可变静态变量
* 实现不安全 trait
* 访问 `union` 的字段

`unsafe` 并不会关闭借用检查器或禁用任何其他 Rust 安全检查：如果在不安全代码中使用引用，它仍会被检查。`unsafe` 关键字只是提供了那五个不会被编译器检查内存安全的功能。

`unsafe` 不意味着块中的代码就一定是危险的或者必然导致内存安全问题：其意图在于作为程序员，你将会确保 `unsafe` 块中的代码以有效的方式访问内存。

为了尽可能隔离不安全代码，最好将不安全代码封装进一个安全的抽象并提供安全 API。

**解引用裸指针**

不安全 Rust 有两个被称为 **裸指针**（*raw pointers*）的类似于引用的新类型。和引用一样，裸指针是不可变或可变的，分别写作 `*const T` 和 `*mut T`。

在裸指针的上下文中，**不可变** 意味着指针解引用之后不能直接赋值。

裸指针与引用和智能指针的区别在于

* 允许忽略借用规则，可以同时拥有不可变和可变的指针，或多个指向相同位置的可变指针
* 不保证指向有效的内存
* 允许为空
* 不能实现任何自动清理功能

```rust
fn main() {     let mut num = 5;
let r1 = &raw const num;
let r2 = &raw mut num;
}
```


创建裸指针。Rust允许创建裸指针，只是仅允许在unsafe块中解引用。

通过as可以让指针和整数之间进行转换。

```rust
let address = 0x012345usize;
let r = address as *const i32;
```
Rust指针不支持+,
-运算
```rust
let mut num = 5;
let r1 = &raw const num;
let r2 = &raw mut num;
unsafe {     // 在unsafe块中解引用*指针     println!("r1 is: {}", *r1);
println!("r2 is: {}", *r2);
}
```


创建一个指针不会造成任何危害；只有当访问其指向的值时才有可能遇到无效的值。

代码中创建了同时指向相同内存位置 `num` 的裸指针 `*const i32` 和 `*mut i32`。相反如果尝试同时创建 `num` 的不可变和可变引用，代码将无法通过编译。通过裸指针，就能够同时创建同一地址的可变指针和不可变指针，若通过可变指针修改数据，则可能潜在造成数据竞争。

**调用不安全的函数**

不安全函数和方法与常规函数方法十分类似，除了其开头有一个额外的 `unsafe`。

在此上下文中，关键字 `unsafe` 表示该函数具有调用时需要满足的要求，而 Rust 不会保证满足这些要求。

通过在 `unsafe` 块中调用不安全函数，表明我们已经阅读过此函数的文档并对其是否满足函数自身的契约负责。

而 `unsafe` 就是向Rust断言，我们已经读过文档了。

**创建不安全的安全抽象**

仅仅因为函数包含不安全代码并不意味着整个函数都需要标记为不安全的。事实上，将不安全代码封装进安全函数是一种常见的抽象方式。

标准库中的函数 `split_at_mut`，它需要一些不安全代码，让我们探索如何可以实现它。这个安全函数定义于可变 slice 之上：它获取一个 slice 并从给定的索引参数开始将其分割为两个 slice。

```rust
fn main() {     let mut v = vec![1, 2, 3, 4, 5, 6];
let r = &mut v[..];
let (a, b) = r.split_at_mut(3);
assert_eq!(a, &mut [1, 2, 3]);
assert_eq!(b, &mut [4, 5, 6]);
}
```


接下来实现`split_at_mut`这个函数

```rust
fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {     let len = values.len();
assert!(mid <= len);
(&mut values[..mid], &mut values[mid..]) } // 不可编译
```


Rust 只知道values被可变引用借用了两次，而不知道其并不重叠。

正确的方法：

```rust
use std::slice;
fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();
    let ptr = values.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (
            slice::from_raw_parts_mut(ptr, mid),
            slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}
```


slice 是一个指向一些数据的指针，并带有该 slice 的长度。可以使用 `len` 方法获取 slice 的长度，使用 `as_mut_ptr` 方法访问 slice 的裸指针。

`slice::from_raw_parts_mut` 函数获取一个裸指针和一个长度来创建一个 slice。

`slice::from_raw_parts_mut` 函数是不安全的因为它获取一个裸指针，并必须确信这个指针是有效的。

裸指针上的 `add` 方法也是不安全的，因为其必须确信此地址偏移量也是有效的指针。

`slice::from_raw_parts_mut` 和 `add` 放入 `unsafe` 块中以便能调用它们。

但无需将这个函数也写成`unsafe`因为这个函数是正确的。

**使用 extern 函数调用外部代码**

Rust 有一个关键字，`extern`，有助于创建和使用 **外部函数接口**（*Foreign Function Interface*，FFI）。

外部函数接口是一个编程语言用以定义函数的方式，其允许不同（外部）编程语言调用这些函数。

```rust
unsafe extern "C" {     fn abs(input: i32) -> i32;
}  fn main() {     unsafe {         println!("Absolute value of -3 according to C: {}", abs(-3));
} }
```


在 `unsafe extern "C"` 块中，我们列出了希望能够调用的另一个语言中的外部函数的签名和名称。`"C"` 部分定义了外部函数所使用的 **应用二进制接口**（*application binary interface*，ABI） —— ABI 定义了如何在汇编语言层面调用此函数。`"C"` ABI 是最常见的，并遵循 C 编程语言的 ABI。

`unsafe extern` 中声明的任何项都隐式地是 `unsafe` 的。然而，一些 FFI 函数**可以**安全地调用。可以使用 `safe` 关键字来表明这个特定的函数即便是在 `unsafe extern` 块中也是可以安全调用的。一旦我们做出这个修改，调用它不再需要 `unsafe` 块。

```rust
unsafe extern "C" {     safe fn abs(input: i32) -> i32;
}  fn main() {     println!("Absolute value of -3 according to C: {}", abs(-3));
}
```


**让别的语言调用 Rust 函数**

可以使用 `extern` 来创建一个允许其它语言调用 Rust 函数的接口。不同于创建整个 `extern` 块，就在 `fn` 关键字之前增加 `extern` 关键字并为相关函数指定所用到的 ABI。还需增加 `#[no_mangle]` 注解来告诉 Rust 编译器不要 mangle 此函数的名称。*Mangling* 指编译器将我们命名的函数名更改为包含更多供其他编译过程使用的信息的名称，不过可读性较差。每一个编程语言的编译器都会以稍微不同的方式 mangle 函数名，所以为了使 Rust 函数能在其他语言中指定，必须禁用 Rust 编译器的 name mangling。这是不安全的因为在没有内置 mangling 的时候在库之间可能有命名冲突，所以确保所选的名称可以不用 mangling 地安全导出是我们的责任。

在如下的例子中，一旦其编译为动态库并从 C 语言中链接，`call_from_c` 函数就能够在 C 代码中访问：

```rust
#[unsafe(no_mangle)] pub extern "C" fn call_from_c() {     println!("Just called a Rust function from C!");
}
```


这种 `extern` 用法只在属性中需要 `unsafe`，而不需要在 `extern` 块本身使用 `unsafe`。

**访问或修改可变静态变量**

**全局变量**（*global variables*），Rust 确实支持它们，不过这对于 Rust 的所有权规则来说是有问题的。如果有两个线程访问相同的可变全局变量，则可能会造成数据竞争。

全局变量在 Rust 中被称为 **静态**（*static*）变量。

```rust
static HELLO_WORLD: &str = "Hello, world!";
fn main() {     println!("name is: {HELLO_WORLD}");
}
```


通常静态变量的名称采用 `SCREAMING_SNAKE_CASE` 写法。静态变量只能储存拥有 `'static` 生命周期的引用，这意味着 Rust 编译器可以自己计算出其生命周期而无需显式标注。访问不可变静态变量是安全的。

常量与不可变静态变量的一个微妙的区别是静态变量中的值有一个固定的内存地址。使用这个值总是会访问相同的地址。另一方面，常量则允许在任何被用到的时候复制其数据。另一个区别在于静态变量可以是可变的。访问和修改可变静态变量都是 **不安全** 的。

比如：

```rust
static mut COUNTER: u32 = 0;

/// SAFETY: Calling this from more than a single thread at a time is undefined
/// behavior, so you *must* guarantee you only call it from a single thread at
/// a time.
unsafe fn add_to_count(inc: u32) {
    unsafe {
        COUNTER += inc;
    }
}

fn main() {
    unsafe {
        // SAFETY: This is only called from a single thread in `main`.
        add_to_count(3);
        println!("COUNTER: {}", *(&raw const COUNTER));
    }
}
```


当我们编写一个不安全函数，惯常做法是编写一个以 `SAFETY` 开头的注释并解释调用者需要做什么才可以安全地调用该方法。同理，当我们进行不安全操作时，惯常做法是编写一个以 `SAFETY` 开头并解释安全性规则是如何维护的。

拥有可以全局访问的可变数据，难以保证不存在数据竞争，这就是为何 Rust 认为可变静态变量是不安全的。在任何可能的情况下，请优先使用线程安全智能指针，这样编译器就能检测不同线程间的数据访问是否是安全的。

**不安全的 trait **

可以使用 `unsafe` 来实现一个不安全 trait。当 trait 中至少有一个方法中包含编译器无法验证的不变式（invariant）时该 trait 就是不安全的。可以在 `trait` 之前增加 `unsafe` 关键字将 trait 声明为 `unsafe`，同时 trait 的实现也必须标记为 `unsafe`。

```rust
unsafe trait Foo {
    // methods go here
}

unsafe impl Foo for i32 {
    // method implementations go here
}
```


通过 `unsafe impl`，我们承诺将保证编译器所不能验证的不变式。

如果我们定义的类型包含某些未实现 `Send` 或 `Sync` 的类型，例如裸指针，但又想将该类型标记为 `Send` 或 `Sync`，就必须使用 `unsafe`。Rust 不能验证我们的类型保证可以安全的跨线程发送或在多线程间访问，所以需要我们自己进行检查并通过 `unsafe` 表明。

**访问联合体 union 中的字段**

联合体主要用于和 C 代码中的联合体进行交互。访问联合体的字段是不安全的，因为 Rust 无法保证当前存储在联合体实例中数据的类型。

**使用 miri 检查不安全代码**

使用 Miri，一个用来检测未定义行为的 Rust 官方工具。

借用检查器是一个在编译时工作的**静态**工具，Miri 是一个在运行时工作的**动态**工具。它通过运行程序，或者测试集来检查代码，并检测你是否违反了它理解的 Rust 应该如何工作的规则。

使用 Miri 要求使用 nightly 版本的 Rust。

`rustu +nightly component add miri` 可以安装 nightly Rust 和 miri。

通过输入 `cargo +nightly miri run` or `cargo +nightly miri test` 在项目中使用 Miri。

Miri 并不能捕获编写不安全代码时可能出现的所有错误。Miri 是一个动态分析工具，因此它只能捕获代码实际运行时出现的问题。这意味着需要将其与良好的测试技术相结合以增强你对所编写的不安全代码的信心。Miri 也不能覆盖代码所有的不可靠的地方。

## 高级 trait

**关联类型**

**关联类型**（*associated types*）将一个类型占位符与 trait 相关联，使得该 trait 的方法定义可以在签名中使用这些占位符类型。该 trait 的实现者会为每个具体实现指定要使用的具体类型来替代占位符类型。这样，我们就能在定义 trait 时使用占位符类型，而无需预先知道这些类型的具体内容，直到实现该 trait 时再进行指定。

```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}
```


关联类型类似于泛型的trait。

关联类型也会成为 trait 契约的一部分：trait 的实现必须提供一个类型来替代关联类型占位符。关联类型通常以它的用途来命名。

**默认泛型类型参数和运算符重载**

当使用泛型类型参数时，可以为泛型指定一个默认的具体类型。如果默认类型就足够的话，这消除了为具体类型实现 trait 的需要。为泛型类型指定默认类型的语法是在声明泛型类型时使用 `<PlaceholderType=ConcreteType>`。

Rust 并不允许创建自定义运算符或重载任意运算符，但可以通过实现 `std::ops` 中列出的运算符相关 trait 来重载它们。

比如：

```rust
use std::ops::Add;
#[derive(Debug, Copy, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    assert_eq!(
        Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
        Point { x: 3, y: 3 }
    );
}
```


而`add trait`定义是：

```rust
trait Add<Rhs = Self> {
    type Output;

    fn add(self, rhs: Rhs) -> Self::Output;
}
```


`Rhs=Self`：这个语法叫做 **默认类型参数**（*default type parameters*）。`Rhs` 是一个泛型类型参数（“right-hand side” 的缩写），它用于定义 `add` 方法中的 `rhs` 参数。如果实现 `Add` trait 时不指定 `Rhs` 的具体类型，`Rhs` 的类型将默认为 `Self`，即正在实现 `Add` 的类型。

默认参数类型主要用于如下两个方面：

* 扩展类型而不破坏现有代码。
* 在大部分用户都不需要的特定情况进行自定义。

**同名方法消除歧义**

Rust 既不能避免一个 trait 与另一个 trait 拥有相同名称的方法，也不能阻止为同一类型同时实现这两个 trait。同时也可以直接在类型上实现一个与 trait 方法同名的方法。

当调用这些同名方法时，需要告诉 Rust 我们想要使用哪一个。

也就是需要明确说出到底用的是那个, 即用

`Trait::method` 的方式来调用函数。而这个时候，如果不指明的化，那么会调用类型方法，而不是`trait`方法

或者这样：

```rust
fn main() {     println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
}
```


指明类型。使用`<Type as Trait>::function`的方法指明

完全限定语法：

`<Type as Trait>::function(receiver_if_method, next_arg, ...);`

```rust
trait A {
    fn func(&self) {
        println!("A func\n");
    }
}

trait B {
    fn func(&self) {
        println!("B func\n");
    }
}

struct T {}

impl A for T {}
impl B for T {}

impl T {
    fn func(&self) {
        println!("T func\n");
    }
}

fn main() {
    let t = T {};
    t.func(); // Calls T's func
    A::func(&t); // Calls A's func
    B::func(&t); // Calls B's func
    <T as A>::func(&t);
    <T as B>::func(&t);
}
```


**超 trait**

有时我们可能会需要编写一个依赖另一个 trait 的 trait 定义：对于一个实现了第一个 trait 的类型，你希望要求这个类型也实现了第二个 trait。如此就可使 trait 定义使用第二个 trait 的关联项。这个所需的 trait 是我们实现的 trait 的 **超（父）trait**（*supertrait*）。

这种技术类似于为 trait 增加 trait bound。

比如：

```rust
trait A {     fn func(&self) {         println!("A func\n");
} }  trait B {     fn func(&self) {         println!("B func\n");
} }  // 要求实现C之前必须实现A和B trait C: A + B {     fn func(&self) {         A::func(self);
B::func(self);
println!("C func\n");
} }
```


**使用 newtype 模式在外部类型上实现外部 trait**

孤儿规则（orphan rule），它规定只有当 trait 或类型至少有一方或两者都对于当前 crate 是本地时，才能在该类型上实现该 trait。一个绕开这个限制的方法是使用 **newtype 模式**（*newtype pattern*），它涉及到在一个元组结构体中创建一个新类型。这个元组结构体带有一个字段作为希望实现 trait 的类型的简单封装。由于这个封装类型对于 crate 是本地的，这样就可以在这个封装上实现 trait。

*Newtype* 是一个源自 Haskell 编程语言的概念。使用这个模式没有运行时性能惩罚，这个封装类型在编译时就被省略了。

如果希望新类型拥有其内部类型的每一个方法，为封装类型实现 `Deref` trait 并返回其内部类型是一种解决方案。如果不希望封装类型拥有所有内部类型的方法 —— 比如为了限制封装类型的行为 —— 则只需自行实现所需的方法即可。

## 高级类型

**使用类型别名创建类型同义词**

Rust 提供了声明 **类型别名**（*type alias*）的能力，使用 `type` 关键字为现有类型赋予另一个名字。

`type Kilometers = i32;`

这意味着 `Kilometers` 是 `i32` 的 **同义词**（*synonym*）；

`Kilometers` 并不是一个新的、单独的类型。`Kilometers` 类型的值将被完全当作 `i32` 类型值来对待：

```rust
type Kilometers = i32;
let x: i32 = 5;
let y: Kilometers = 5;
println!("x + y = {}", x + y);
```


但通过这种手段无法获得 newtype 模式所提供的类型检查的好处。

换句话说，如果在某处混用 `Kilometers` 和 `i32` 的值，编译器也不会给出一个错误。

类型别名的主要用途是减少重复。

比如：`type Thunk = Box<dyn Fn() + Send + 'static>;`

**从不返回的 never type**

Rust 有一个叫做 `!` 的特殊类型。在类型理论术语中被称为 *empty type*，因为它没有值。我们更倾向于称之为 *never type*。这个名字描述了它的作用：在函数从不返回的时候充当返回值。

从不返回的函数被称为 **发散函数**（*diverging functions*）。

比如：

```rust
fn
bar
()
->
!
{     // --snip--     panic!
(); // 如果注释掉这行，则返回
() }
```
下面代码是可以编译的：
```rust
let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => continue,
};
```


但是continue类型显然和num不同。

也就是 continue`的值是`!

当 Rust 要计算 `guess` 的类型时，它会查看这两个分支。前者是 `u32` 值，而后者是 `!` 值。因为 `!` 类型永远不会有值，Rust 决定 `guess` 的类型是 `u32`。

描述这种行为的正式方式是，类型为 `!` 的表达式可以被强制转换为任意其他类型。

事实上并未对 `guess` 进行赋值。

最后一个有着 `!` 类型的表达式是 `loop`：

循环永远也不结束，所以此表达式的值是 `!`。但是如果引入 `break` 这就不为真了，因为循环在执行到 `break` 后就会终止。

**动态大小类型和 Sized trait**

Rust 需要知道有关类型的某些细节，例如为特定类型的值需要分配多少空间。这便是起初留下的一个类型系统中令人迷惑的角落：即 **动态大小类型**（*dynamically sized types*）的概念。这有时被称为 “DST” 或 “unsized types”，它们让我们能够编写使用那些只有在运行时才能知道大小的值的代码。

单独的 `str` 就是一个 DST。因为他到运行时才知道具体大小。

Rust 需要知道应该为特定类型的值分配多少内存，同时所有同一类型的值必须使用相同数量的内存。

```rust
let s1: str = "Hello there!";
let s2: str = "How's it going?"; // 不可编译
```


如果允许编写这样的代码，也就意味着这两个 `str` 需要占用完全相同大小的空间。不过它们有着不同的长度：`s1` 需要 12 字节存储，而 `s2` 需要 15 字节。这也就是为什么不可能创建一个存放动态大小类型的变量的原因。

虽然 `&T` 是一个储存了 `T` 所在的内存位置的单个值，`&str` 则是**两个**值：`str` 的地址和其长度。这样，`&str` 就有了一个在编译时可以知道的大小：它是 `usize` 长度的两倍。

就是 Rust 使用动态大小类型的方式：它们有一些额外的元信息来储存动态信息的大小。这引出了动态大小类型的黄金法则：必须将动态大小类型的值置于某种指针之后。

可以将 `str` 与所有类型的指针结合：比如 `Box<str>` 或 `Rc<str>`。

`trait`也是动态大小类型，每一个 trait 都是一个可以通过 trait 名称来引用的动态大小类型。

为了将 trait 用于 trait 对象，必须将它们放入指针之后，比如 `&dyn Trait` 或 `Box<dyn Trait>`（`Rc<dyn Trait>` 也可以）。

为了处理 DST，Rust 提供了 `Sized` trait 来决定一个类型的大小是否在编译时可知。

该 trait 会自动为所有在编译时大小已知的类型实现。此外，Rust 隐式地为每一个泛型函数增加了 `Sized` bound。

默认情况下，泛型函数只能作用于在编译时大小已知的类型。

除非：

```rust
fn
generic<T:
?Sized>
(t: &T)
{     // --snip-- }
```


`?Sized` 这个 trait bound 表示 “`T` 可以是 `Sized`，也可以不是 `Sized`” 同时这个注解会覆盖泛型类型必须在编译时拥有固定大小的默认规则。具有该含义的 `?Trait` 语法仅适用于 `Sized`，而不适用于其他任何 trait。

在这个时候，参数不能使用`T`必须是某种形式的指针，比如引用之类的。

## 高级函数与闭包

**函数指针**

函数会被强制转换为 `fn` 类型（小写的 f），不要与闭包 trait 的 `Fn` 相混淆。`fn` 被称为 **函数指针**（*function pointer*）。通过函数指针允许我们使用函数作为其它函数的参数。

```rust
fn add_one(x: i32) -> i32 {
    x + 1
}

fn do_twice(f: fn(i32) -> i32, arg: i32) -> i32 {
    f(arg) + f(arg)
}

fn main() {
    let answer = do_twice(add_one, 5);
    println!("The answer is: {answer}");
}
```


感觉Rust中的函数是无状态的，如果其有状态，应该是使用了全局变量导致的，中间存在unsafe段，这一点从所有函数都默认实现`Fn trait`可以看出。

不同于闭包，`fn` 是一个类型而不是一个 trait，所以直接指定 `fn` 作为参数而不是声明一个带有 `Fn` 作为 trait bound 的泛型参数。

函数指针实现了所有三个闭包 trait（`Fn`、`FnMut` 和 `FnOnce`），所以总是可以在调用期望闭包的函数时传递函数指针作为参数。倾向于编写使用泛型和闭包 trait 的函数，这样它就能接受函数或闭包作为参数。

一个只期望接受 `fn` 而不接受闭包的情况的例子是与不存在闭包的外部代码交互时：C 语言的函数可以接受函数作为参数，但 C 语言没有闭包。

```rust
fn main() {
    enum Status {
        Value(u32),
        Stop,
    }

    let list_of_statuses: Vec<Status> = (0u32..20).map(Status::Value).collect();
}
```


这里，我们通过 `Status::Value` 的初始化函数，对 `map` 所作用的范围内每个 `u32` 值创建 `Status::Value` 实例。一些人倾向于函数式风格，一些人喜欢闭包。

传入 `Status::Value` 会把 `u32` 转化为枚举类型。

**返回闭包**

闭包表现为 trait，这意味着不能直接返回闭包。对于大部分需要返回 trait 的场景中，可以使用实现了期望返回的 trait 的具体类型来替代函数的返回值。

相反，可以正常地使用 `impl Trait` 语法。

比如：

```rust
fn
returns_closure
()
->
impl
Fn
(i32)
->
i32
{     |x| x + 1 }
```


但是每一个闭包也有其独立的类型。如果需要处理多个拥有相同签名但是不同实现的函数，就需要使用 trait 对象。

比如下面就无法编译：、

```rust
fn main() {
    let handlers = vec![returns_closure(), returns_initialized_closure(123)];
    for handler in handlers {
        let output = handler(5);
        println!("{output}");
    }
}

fn returns_closure() -> impl Fn(i32) -> i32 {
    |x| x + 1
}

fn returns_initialized_closure(init: i32) -> impl Fn(i32) -> i32 {
    move |x| x + init
}
```


每当返回一个 `impl Trait` Rust 会创建一个独特的**不透明类型**（*opaque type*），这是一个无法看清 Rust 为我们构建了什么细节的类型。所以即使这些函数都返回了实现了相同 trait（ `Fn(i32) -> i32`）的闭包，Rust 为我们生成的不透明类型也是不同的。

当然其做法就是用指针包裹。

```rust
fn main() {
    let handlers = vec![returns_closure(), returns_initialized_closure(123)];
    for handler in handlers {
        let output = handler(5);
        println!("{output}");
    }
}

fn returns_closure() -> Box<dyn Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}

fn returns_initialized_closure(init: i32) -> Box<dyn Fn(i32) -> i32> {
    Box::new(move |x| x + init)
}
```


## 宏

**宏**（*Macro*）指的是 Rust 中一系列的功能：使用 `macro_rules!` 的 **声明宏**（*declarative macro*），和三种 **过程宏**（*procedural macro*）：

* 自定义 `#[derive]` 宏，用于在结构体和枚举上通过添加 `derive` 属性生成代码
* 类属性宏，定义可用于任意项的自定义属性
* 类函数宏，看起来像函数，但操作的是作为其参数传递的 token

**宏与函数的区别**

宏就是元编程，也就是写代码的代码。

一直使用 `println!` 宏和 `vec!` 宏。所有的这些宏以 **展开** 的方式来生成比你所手写出的更多的代码。

元编程对于减少大量编写和维护的代码是非常有用的，它也扮演了函数所扮演的角色。但宏有一些函数所没有的附加能力。

一个函数签名必须声明函数参数的数量和类型。相比之下，宏能够接收可变数量的参数。

而且，宏可以在编译器解析代码前展开，例如，宏可以在一个给定类型上实现 trait。而函数则不行，因为函数是在运行时被调用，而 trait 需要在编译时实现。

实现宏的缺点是与函数的定义相比宏的定义更复杂，因为你正在编写生成 Rust 代码的 Rust 代码。由于这样的间接性，宏定义通常要比函数定义更难阅读、理解和维护。

宏和函数的最后一个重要的区别是：在一个文件里调用宏 **之前** 必须定义它，或将其引入作用域，而函数则可以在任何地方定义和调用。

**macro\_rules! 的声明宏用于通用元编程**

Rust 最常用的宏形式是 **声明宏**（*declarative macros*）。

其核心概念是，声明宏允许我们编写一些类似 Rust `match` 表达式的代码。

宏也将一个值和包含相关代码的模式进行比较：此种情况下，该值是传递给宏的 Rust 源代码字面值；模式用于和前面提到的源代码字面值进行比较，一旦匹配成功，每个模式的相关代码会替换传递给宏的代码。所有这一切都发生于编译时。

一个简化的`vec!`宏定义：

```rust
#[macro_export] macro_rules! vec {     ( $( $x:expr ),* ) => {         {             let mut temp_vec = Vec::new();
$(                 temp_vec.push($x);
)*             temp_vec         }     };
}
```


`#[macro_export]` 注解表明只要导入了定义这个宏的 crate，该宏就应该是可用的。如果没有该注解，这个宏不能被引入作用域。

接着使用 `macro_rules!` 和宏名称开始宏定义，且所定义的宏并 **不带** 感叹号。名字后跟大括号表示宏定义体，在该例中宏名称是 `vec` 。

`vec!` 宏的结构和 `match` 表达式的结构类似。此处有一个分支模式 `( $( $x:expr ),* )` ，后跟 `=>` 以及和模式相关的代码块。如果模式匹配，该相关代码块将被展开。鉴于这个宏只有一个模式，那就只有一个有效匹配方式，其他任何模式方向（译者注：不匹配这个模式）都会导致错误。宏模式所匹配的是 Rust 代码结构而不是值。

首先，一对括号包含了整个模式。我们使用美元符号（`$`）在宏系统中声明一个变量来包含匹配该模式的 Rust 代码。美元符号明确表明这是一个宏变量而不是普通 Rust 变量。之后是一对括号，其捕获了符合括号内模式的值用以在替代代码中使用。`$()` 内则是 `$x:expr` ，其匹配 Rust 的任意表达式，并将该表达式命名为 `$x`。

在 `$()` 之后的逗号表示在每个与 `$()` 内代码匹配的实例之间必须出现一个字面量逗号分隔符。紧随逗号之后的 `*` 说明该模式匹配零个或更多个 `*` 之前的任何模式。

当以 `vec![1, 2, 3];` 调用宏时，`$x` 模式与三个表达式 `1`、`2` 和 `3` 对应进行了三次匹配。

在 `$()*` 部分，`temp_vec.push($x)` 会针对模式中每次匹配到 `$()` 的部分，生成零次或多次，取决于模式匹配到多少次。`$x` 由每个与之相匹配的表达式所替换。当以 `vec![1, 2, 3];` 调用该宏时，替换该宏调用所生成的代码会是下面这样：

```rust
{     let mut temp_vec = Vec::new();
temp_vec.push(1);
temp_vec.push(2);
temp_vec.push(3);
temp_vec }
```


**从属性生成代码的过程宏**

**过程宏**（*procedural macros*），更像函数（一种类型的过程）。

过程宏接收 Rust 代码作为输入，在这些代码上进行操作，然后产生另一些代码作为输出，而非像声明式宏那样匹配对应模式然后以另一部分代码替换当前代码。

有三种类型的过程宏，自定义派生（derive），类属性和类函数，它们的工作原理都类似。

创建过程宏时，其定义必须驻留在它们自己的具有特殊 crate 类型的 crate 中。

```rust
use proc_macro;
#[some_attribute] pub fn some_name(input: TokenStream) -> TokenStream {     // do something }
```


定义过程宏的函数接收一个 `TokenStream` 作为输入并生成 `TokenStream` 作为输出。`TokenStream` 是定义于 `proc_macro` crate 里代表一系列 token 的类型，Rust 默认携带了`proc_macro` crate。这就是宏的核心：宏所处理的源代码组成了输入 `TokenStream`，宏生成的代码是输出 `TokenStream`。函数上还有一个属性；这个属性指明了我们创建的过程宏的类型。在同一 crate 中可以有多种的过程宏。

**编写自定义 derive 宏**

提供一个过程式宏以便用户可以使用 `#[derive(HelloMacro)]` 注解它们的类型来得到 `hello_macro` 函数的默认实现。该默认实现会打印 `Hello, Macro! My name is TypeName!`，其中 `TypeName` 为定义了 trait 的类型名。换言之，我们会创建一个 crate。

用于`derive`宏的简单`trait`

```rust
pub trait HelloMacro {     fn hello_macro();
}
```


在定义`derive`的包中，增加`syn`、`quote`和`proc-macro`

```
[lib]
proc-macro
=
true
[dependencies]
syn
=
"2.0"
quote
=
"1.0"
```


需要在`Cargo.toml`中增加`lib`的`proc-macro`

```rust
#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    // Construct a representation of Rust code as a syntax tree
    // that we can manipulate.
    let ast = syn::parse(input).unwrap();

    // Build the trait implementation.
    impl_hello_macro(&ast)
}
```


代码分成了 `hello_macro_derive` 和 `impl_hello_macro` 两个函数，前者负责解析 `TokenStream`，后者负责转换语法树：这使得编写过程宏更加方便。

`syn` crate 将字符串中的 Rust 代码解析成为一个可以操作的数据结构。`quote` crate 则将 `syn` 解析的数据结构转换回 Rust 代码。这些 crate 让解析任何我们所要处理的 Rust 代码变得更加简单：为 Rust 编写完整的解析器并不是一件简单的工作。

当用户在一个类型上指定 `#[derive(HelloMacro)]` 时，`hello_macro_derive` 函数将会被调用。我们已使用 `proc_macro_derive` 注解该函数并指定名称 `HelloMacro`，该名称与我们的 trait 名称相匹配；这是大多数过程宏遵循的惯例。

该函数首先将来自 `TokenStream` 的 `input` 转换为一个我们可以解释和操作的数据结构。这正是 `syn` 派上用场的地方。`syn` 中的 `parse` 函数获取一个 `TokenStream` 并返回一个表示解析出的 Rust 代码的 `DeriveInput` 结构体。

解析出来的 `DeriveInput` 结构体的相关部分：

```
DeriveInput
{     // --snip--      ident: Ident
{         ident: "Pancakes",         span: #0 bytes
(95..103)     },     data: Struct
(         DataStruct
{             struct_token: Struct,             fields: Unit,             semi_token: Some
(                 Semi             )         }     ) }
```


该结构体的字段展示了我们解析的 Rust 代码是一个类单元结构体，其 `ident`（identifier，表示名字）为 `Pancakes`。该结构体里面有更多字段描述了所有类型的 Rust 代码.

```rust
fn impl_hello_macro(ast: &syn::DeriveInput) -> TokenStream {
    let name = &ast.ident;
    let generated = quote! {
        impl HelloMacro for #name {
            fn hello_macro() {
                println!("Hello, Macro! My name is {}!", stringify!(#name));
            }
        }
    };
    generated.into()
}
```


到一个包含以 `ast.ident` 作为注解类型名字（标识符）的 `Ident` 结构体实例。

`quote!` 宏能让我们编写希望返回的 Rust 代码。`quote!` 宏执行的直接结果并不是编译器所期望的所以需要转换为 `TokenStream`。为此需要调用 `into` 方法，它会消费这个中间表示（intermediate representation，IR）并返回所需的 `TokenStream` 类型值。

此处所使用的 `stringify!` 为 Rust 内置宏。其接收一个 Rust 表达式，如 `1 + 2` ，然后在编译时将表达式转换为一个字符串常量，如 `"1 + 2"` 。这与 `format!` 或 `println!` 不同，它计算表达式并接着将结果转换为 `String` 。

有一种可能的情况是，所输入的 `#name` 可能是一个需要打印的表达式，因此我们用 `stringify!` 。`stringify!` 也能通过在编译时将 `#name` 转换为字符串字面值来节省一次内存分配。

之后可以像下面这样将其指定为 `path` 依赖：

```
hello_macro
=
{ path = "../hello_macro" }
hello_macro_derive
=
{ path = "../hello_macro/hello_macro_derive" }
```


**类属性宏**

类属性宏与自定义 `derive` 宏相似，不同之处在于它们不是为 `derive` 属性生成代码，而是允许你创建新的属性。它们也更为灵活；`derive` 只能用于结构体和枚举；属性还可以用于其它的项，比如函数。作为一个使用类属性宏的例子，可以创建一个名为 `route` 的属性用于注解 web 应用程序框架（web application framework）的函数：

```rust
#[route
(GET, "/")]
fn
index
()
{
```


`#[route]` 属性将由框架本身定义为一个过程宏。其宏定义的函数签名看起来像这样：

```rust
#[proc_macro_attribute]
pub
fn
route
(attr: TokenStream, item: TokenStream)
->
TokenStream
{
```


除此之外，类属性宏与自定义派生宏工作方式一致：创建 `proc-macro` crate 类型的 crate 并实现希望生成代码的函数！

**类函数宏**

类函数（Function-like）宏的定义看起来像函数调用的宏。类似于 `macro_rules!`，它们比函数更灵活；例如，可以接受未知数量的参数。

类函数宏获取 `TokenStream` 参数，其定义使用 Rust 代码操纵 `TokenStream`，就像另两种过程宏一样。一个类函数宏例子是可以像这样被调用的 `sql!` 宏：

```rust
let
sql
=
sql!
(SELECT * FROM posts WHERE id=1);
```


这个宏会解析其中的 SQL 语句并检查其是否是句法正确的，这是比 `macro_rules!` 可以做到的更为复杂的处理。

---

1. Formerly known as *object safe*. [↩︎](#fnref1)
