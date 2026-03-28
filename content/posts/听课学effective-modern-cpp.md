---
date: '2025-03-09T13:54:15.000Z'
tags:
- 已完成
- C++
- 复习
categories:
- 编程语言
title: 听课，学effective-modern-cpp
slug: lang-cpp-effective
summary: 结合视频与条款笔记整理 Effective Modern C++ 的核心知识点，侧重类型推导、右值、模板与现代实践。
commentTerm: "听课，学effective-modern-cpp | DogDu's blog"
commentDiscussionNumber: 35
lastmod: '2025-04-04T11:32:10.720Z'
featureimage: "images/covers/cover_17_ocean.webp"
---
这篇文章是跟着视频重新梳理《Effective Modern C++》时留下的笔记，重点放在自己最容易混淆的概念和例子上。

参考视频：[effective-modern-cpp](https://www.bilibili.com/video/BV1Gg4y1p71w)


<!--more-->

# 第一章：类型推导

### Base1：顶层`const`和底层`const`

![base1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base1.webp)

```cpp
// 顶层const：变量本身是常量
const /* 没有指针，这里是顶层 */ int a = 0;

// 底层const：引用由指针实现，这里是底层
const int &ref_a = a;

// 底层const + 顶层const
const /* 底层const */ int *const /* 顶层const */ p = &a;

// 当执行copy时，常量的顶层const不受什么影响，而底层const必须有一致的const资格。
// 因为底层的const是所指向的对象的属性，顶层const是本身的属性
// 本身当然不能修改所指向的对象的属性
// 从安全角度考虑更容易理解
```


有点嗯背了。

**只有指针有所谓的`const`顶层，`const`底层。其他类型包括引用只有底层。**

### Base2：值类型与右值引用

![base2](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base2.webp)

1. 联想到汇编很容易理解
2. 想到重载的 `T& operator++()` 和`const T operator++(int)`
3. 右值引用&&只能绑定右值（但他仍然是引用），左值引用&只能绑定左值，
4. 那么可见`std::move`其实就是**将左值类型强制转化为右值**。移动语义没移动 -> 是类本身做的这个事情，如果类没有实现移动构造，那么会调用`onst T&`构造。完美转发不完美，哈哈哈。
5. 字符串字面量不是右值，因为它存在静态内存中，是持久存在的。
6. **把左值转化为右值的值，成为将亡值，所以它既是左值也是右值。**
7. `T &&a = std::move(b);` 什么都不会发生，差不多等于：`T &a = b;`
8. **顶层const不构成重载。**
9. **右值引用仍然是左值**

### Base3：类型推导

![base3](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base3.webp)

1. 数组名不等于指针，但是数组可以退化成指针。也就是**数组的长度信息丢失了。**
2. 字符串字面量，是字符串数组，放在静态区，`“hello world”` 其实是 `const char[12]`，所以可以 `const char *s = “hello world”`来进行赋值。这里发生了数组类型的退化。对于`char *s = “hello world”`来说，编译器会警告，如果进行写操作会段错误。
3. 函数指针与函数名，对函数指针赋值的时候 `ptr = func/&func；`都可以，可以认为发生了函数名的退化。同样的，在使用的时候`(*ptr)()/ptr();`都可以，这就比较混乱了。
4. 类型别名，`typedef` 和 `using`都可以定义类型别名，不过`using`更好用。`typedef`在定义函数指针别名时，需要`typedef bool (*func)(int, int)`也就是`using func = bool (*)(int, int) using func = bool (int, int)`
5. 函数指针作为返回值使用

## 条款一：理解模板类型推导

![item1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item1.webp)

1. up 主想的一个很鬼畜的事情，对函数指针进行底层const，这是没必要的事情，因为函数本身就不可能被修改，总不能深入代码区去修改字节码吧。同样，函数指针的底层const会被编译器忽略，也是很合理的事情。
2. `template<typename T> func(&& T)` 会发生**引用折叠**，会把T的&给折叠成一个，当然引用折叠会发生在多个情况。在函数的声明中使用 && 是万能引用了，因为既可以接受右值引用也可以接受左值引用。
3. GPT出来的：`T& & 折叠为 T&； T& && 折叠为 T&； T&& & 折叠为 T&&； T&& && 折叠为 T&&。`
4. 万能引用的写法只有 `&& T` 和`auto &&` ，只要稍作更改，比如 `const && T`，那么就会变成右值引用。

## 条款七：区别使用`（）`与 `{}` 创建对象

![item7_1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item7_1.webp)

![item7_2](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item7_2.webp)

1. 构造有五种： `A a=10; A a(10); A a=(10);`  `A a{10}; A a={10};` 前三种一样（在开启返回值优化之后，否则会发生一次隐式转换），后两种一样（在auto初始化时略有区别）。
2. A a=10;和A a=(10)；的缺陷是，只能接受一个参数，同时会发生一次隐式转换。
3. A a(10)的缺陷是，在作为**函数的参数传递**时，会发生一次copy构造。
4. A a{10}；的优点就是解决了上面的缺陷，同时**不允许缩窄转换。简化了聚合类的初始化。对解析问题天生免疫。**

   （解析问题就是括号问题导致的变量声明和函数声明区别）。
5. { }初始化包裹问题，感觉更多的是字面量初始化的时候的问题。
6. **总是优先匹配列表初始化，即时编译时报错。除非类型之间不存在隐式转换。**
7. 空的 `{ }` 不会调用列表初始化，但是`{{}}`和 `({})`会

## 条款二：理解`auto`类型推导

![item2](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item2.webp)

1. `auto x = {2};`会匹配成列表，但是 `auto x{2}会把 2 当成int；`
2. `auto x = {2,3};`是列表。但是 `auto x{2,3}`八成会报错。
3. `typelate<typename T> func(T x)`是推导不出来列表的，必须直接声明出列表。
4. `auto`作为返回值时，是按模板的规则走的。
5. **`auto`和模板大部分一致，个别不一致。**

## 条款九：优先考虑别名声明而非`typedef`

![item9](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item9.webp)

1. `typename` 用来澄清模板内部的**T 标志某个类型成员，而非数据成员。**
2. **C++默认访问的是一个非类型成员，在使用`::`的时候。**
3. 对于模板来说，`using`比`typedef`更好用。使用`using`声明别名可以更清晰的表示是一个类型，即使在模板内部。
4. 类型萃取器。用来添加/删除模板T的修饰。也可以用来判断一个对象是否是某个类的实例。
5. 注意`using`的作用域。

## 条款二十三：理解std::move和std::forward

![item23](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item23.webp)

1. `std::move`的实现：使用类型萃取，把类型萃取出来，然后加上 `&& ， std::move`本质是右值转换。把一个右值转化为将亡值。让这个对象很适合被移动，但是到底移动不移动，这不好说。，
2. 对于`const`类型，`std::move`还是返回的是一个`const`类型的右值引用，但这个时候`const`的右值引用和右值引用类型是不匹配的。
3. `std::forward`就是转发。结果一个问题：**对于函数参数，T &&param，函数内部一定对param变成一个左值，而非右值。原参数的左右值信息丢失了**
4. `std::forward`就是有条件的`move`，只有实参用右值初始化的时候才转化为右值，而`std::move`本质是将左值转化为右值。

## 条款三：理解delctype

![item3](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item3.webp)

1. `decltype + 变量`，所有信息均被保留，数组与函数也不会退化。
2. `decltype + 表达式` 会返回表达式结果对应的类型。不是左值就是右值

   {左值：得到该类型的引用；右值：得到该类型}
3. `decltype` 不是实际计算表达式的值，只会推断其类型。
4. `decltype(auto)`可以保留 xxx 的全部细节。可以认为等价于 `auto -> decltype(返回值)`
5. **右值不一定不能放在等号的左边，因为这本质上是在调用operator = 操作**，但是这种操作应该避免，避免在函数返回值返回 T ，应该返回const T来避免这种情况。
6. `func(T &&t) { return t; }` 返回的是一个左值，可以用完美转发来替代。

### Base4：C++类对象的布局

![base4](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base4.webp)

1. 非虚函数，不会影响对象的大小，放在代码区中。
2. **虚函数，当然函数还是放在代码区，但会影响对象的大小，多 8/4 个字节，用来存放一个指针，指向虚表。**
3. 非静态成员，会影响对象大小。
4. 静态成员，不会影响对象大小。
5. **有虚函数的类，其地址本身就是指向虚表的指针的地址**。也就是说指向虚表的指针的地址存在类的最起点，可以根据这个地址来进行验证虚表的存在。
6. **type\_info是C++的一个标准数据类型，在虚表的头，也就是虚表的 -1 处**，记录着有关类的信息。比如类名之类的。

#### C++的内存模型

![在这里插入图片描述](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/e2ddd03247dfd64436d2955004f1d146.webp)

### Base5：C++中的多态和RTTI

![base5](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base5.webp)

![base5_1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base5_1.webp)

1. `RTTI（RunTime Type Identification）`也即运行期间类型识别，但在C++中，只有包含虚函数的类才能支持RTTI。  
   原因也很简单，因为只有包含虚函数的类，才有虚表，才有type\_info
2. 对于需要使用继承的基类，其析构函数应该为虚函数，这点在effective C++也提到了。
3. 对于类的函数来说，**成员函数有一个隐含的参数为this指针**。相当于Python的self。
4. typeid() 是RTTI的机制，也就是访问虚表的type\_info信息。
5. `dynamic_cast` 也是RTTI的机制

### Base6：各种类型转换

![base6](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base6.webp)

1. `static_cast` 静态类型转换，这是在编译期间完成的类型转换。

   * 子类可以转化成父类。反之不行。
2. `dynamic_cast` 动态类型转换，在运行期间判断
3. `const_cast` 增加一个底层`const`，或者去掉一个底层`const`

   * 虽然可以去掉`const`，但是操作的时候该段错误还是段错误。
   * 用途是可以**重载`const`函数。减少代码重复。**
4. `reinterpret_cast` 是重新解释，是最强的类型转换

   * 是静态类型转换，是编译期间发生的。
   * 与C语言的强制类型转换略有区别，比如 ： `int x = (float)y;` 在C语言中，会进行类型转换。但是`reinterpret_cast`不会进行类型转换，反而告诉你不能转换。
   * 要求两个东西必须`sizeof`相等。
   * 更多用于指针包括整型之间的转换。
   * **只进行 bit 级别转换**

# 第二章：auto

### Base7：lambda表达式初探

![base7](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base7.webp)

1. `lambda`的实现，是实现一个匿名的可调用类，重载了`operator ()`

   例如：

   |  |  |
   | --- | --- |
   | ```cpp
   size_t sz = 0;
   auto Sizecomp = [sz] (const string &a) { return a.size() > sz; }
   ```
|
```cpp
   // 等价于：
   struct Sizecomp {
   	size_t sz;
   	Sizecomp(size_t sz_) : sz(sz_) {}
   	auto operator(const string &a) { return a.size() > sz; }
   };
   ``` |



   |  |
   | --- |
   | ```cpp
   // 等价于：
   struct Sizecomp {
   	size_t sz;
   	Sizecomp(size_t sz_) : sz(sz_) {}
   	auto operator(const string &a) { return a.size() > sz; }
   };
   ``` |
2. `lambda` 表达式语法。`[captures] (params) specifies exception -> ret { body; }`

   * `specfies` 默认为 const 相当于类中成员函数的 const 修饰，也即默认不能修改捕获列表中的变量，即使是copy来的变量。
   * `exception：`可使用noexcept表示函数是否会抛出异常。
   * `ret` 可选返回类型，大多情况可以自行推导，但**初始化列表不行。**
   * `params` 可选参数列表，since C++14 可以使用 auto
   * `capture` 捕获列表

     1. **只能捕获非静态局部变量**，可按值，按引用或者组合。因为全局变量或者静态变量，**不需要捕获**，按照lambda使用类来实现，是一个局部变量来考虑的话，倒也好理解。**虽然不用捕获就能访问，但是会是引用形式的，一定注意是否与预期相符合**
     2. **捕获发生在定义，而不是使用时**。这也好理解，lambda是一个局部的对象的示例，当定义之后，就相当于对象的定义以及构造。
     3. **广义的捕获（since C++14）：捕获列表客传右值**。这样可以让一个不可拷贝的函数变得可以使用，避免无意义拷贝。
     4. **特殊的捕获方法**

        [this] 捕获this指针，可以使用this类型的成员变量与函数。

        [=] 捕获所有局部变量的值，包括this。但是是用到哪些才捕获那些，不会实际上全部捕获。

        [&] 捕获全部，引用全部。

        [*this] 捕获*this的**副本**，since C++17。

### Base8：可调用对象类型

![base8](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base8.webp)

1. 闭包：带有**上下文 (状态)** 的函数。

   * 闭包的实现方法：`operator()； lambda； std::bind` （把一个函数的某个参数特化，有点函数特化的意思）；
   * **为了实现泛型，更加灵活。**
2. 可调用对象和function

   C++中的可调用对象

   * 函数 -> **可退化为函数指针**
   * 函数指针
   * lambda -> 当**捕获列表**一无所有的时候，可退化为函数指针
   * std::bind： -> 返回 binder

     `std::bind(callable, arg1, arg2, arg3,….); callable为可调用对象`，如果为类的非静态成员函数，需要在arg1传入对象实例的指针，相当于传this。`std::placeholders::_1` 等占位符可以用来占位。
   * 重载operator() 的类

   这五种类型都不同，他们五个不能完全相互转换。

   但是**std::function**可以容纳他们五种所有的可调用对象。

## 条款五：优先考虑auto而非显示类型声明

![item5](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item5.webp)

1. 想把`lambda`赋值给一个变量一定要用 auto ？这不一定，可以用`std::function`，不过这有一定的性能损耗。
2. 避免copy，比如：`for(auto &p : map)` 和 `for(const std::pair<int, int> &p : map)`，其中类型是错误的，可能会出现一个隐藏的copy。

### Base9：CRTP与Expression Templates

![base9](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base9.webp)

[【编程技术】C++ CRTP & Expression Templates\_crtp与expression templates-CSDN博客](https://blog.csdn.net/HaoBBNuanMM/article/details/109740504)

1. CRTP 奇异模板递归：

   编译器多态实现运行时多态。而且没有查虚表的过程。
2. Expression Templates表达式模板: 延时计算与节省表达式中间结果。

   这个在高性能计算中非常强大。

   例如：

   |  |
   | --- |
   | ```cpp
vector v0 = {1,2,3}, v1 = {2,3,4}, v2 = {3,4,5};
   auto v3 = v0 + v1 + v2; // 中间有临时变量的存在，导致非常低效
``` |

 延时计算：推迟计算，直到需要结果。

 也就是说把运算符转化为一个模板类，直到通过模板类来获取结果的时候才进行计算。

 **优点是直到需要才计算**，缺点是每次访问都需要计算。

 模板类它本身不存储结果。

 相当于把运算结果委托给一个模板类，在通过这个委托模板类来获取计算结果时，这个时候模板类才进行计算。

 就是下面所说的代理类。

## 条款六：auto推导若非己愿，则使用显示类型声明

1. 代理类，代理类就是模仿和增强一些类型的行为为目的而存在的类。

   比如：`std::vector<bool>::reference` 来引用 `std::vector<bool>` 的bit。

   比如：智能指针是代理类，实现对原始指针的封装。
2. **C++不允许一个类型到另一个类型两次隐式类型转换。**
3. 临时变量的引用，不要用引用来接。也就是不要对临时变量来引用。

   例如：`A &a = func()[2];` 其中 func 返回一个临时变量。
4. 第一点和第三点结合起来，可能会导致 **auto 推导出一个对临时代理类的引用。**
5. 请记住：

   * 不可见的代理类可能会使 auto 从表达式中推导出不期望得到的类型
   * 显式类型初始化惯用法强制 auto 推导出你想要的类型

# 第三章：移步现代C++

## 条款八：优先考虑nullptr，而非NULL和0

![item8](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item8.webp)

* 因为 NULL 和 0 是 long 类型，而非指针类型。当重载时，会导致调用与期望不符的函数。
* 使用模板时，**NULL 和 0 可能会导致 long 或 int 类型的模板实例化**，这是灾难性的。
* nullptr可以保证是一个指针。

### Base10：构造函数语义学

![base10](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base10.webp)

1. 编译器是何如完善构造函数的。

   1. **列表初始化先于构造函数。**
   2. 基类存在默认构造函数，编译器负责按插子类构造函数。
   3. 如果存在虚表指针，**编译器进行虚表指针的安放。**
2. 如果定义的class中没有默认的构造函数

   1. 如果编译器需要做什么，那么会构造默认的构造函数。
   2. 否则，编译器不会合成默认构造函数。
3. 基类如果没有默认构造函数，子类需要手动初始化，这显然。
4. 使用 `using` 去掉子类中冗余的构造函数。`using Base::Base;` 可以直接使用父类的构造函数。

## 条款十五：尽量使用constexpr

![item15](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item15.webp)

1. `const`常量的不确定性。

   `const`的常量必须是真正的字面量才会归为编译器常量。

   说白了就是增强了`const` 的能力，让编译器在编译期间能够得知更多的常量。
2. PS：gcc的数组长度支持动态。
3. `constexpr`值，只要用`constexpr`就确定变量是编译期常量。

   **所有constexpr都是const，但不是所有const都是constexpr。**
4. 对函数进行constexpr的修饰

   * C++11 ： 这个时候的 constexpr 纯废物。

     1. 普通函数返回值必须返回个什么东西, 也就是不允许是 `void`
     2. 普通的 constexpr 函数体只能是 return expr； 只能有一句话。而且expr也必须是一个常量表达式
     3. 如果传给 constexpr 函数运行时的值，那么 constexpr 函数会退化成一个普通函数。
     4. constexpr 不能传给形参。
     5. constexpr 构造函数初始化列表必须是常量表达式。
     6. constexpr 构造函数的函数体必须为空
     7. 所有用constexpr修饰构造函数的类，析构函数都是默认的。
     8. constexpr 声明的成员函数，具有 const 属性。
   * C++14对 constexpr 进行了增强。

     1. C++11 中 1.、2.、6.、8. 限制被删除。
     2. 函数可以修改生命周期与变量表达式相同的对象。这是容易理解的。
     3. 即可退化也可编译期间。
   * C++17可以 if constexpr （bool const experssion）

     **比 #if 更加优秀的方法。让一部分东西直接不编译。**

   constexpr显然会提高编译时间。

## 条款十七：理解特殊成员函数的生成

![item17](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item17.webp)

1. 声明这五个特殊成员函数之一，那么剩下四个也应该声明出来。

   原因：只有需要手动管理资源的时候，才会声明这些函数。
2. C++11以及之后，声明 上图1/2/3 不会生成 4/5.
3. 移动构造和复制更像是一种请求，这个时候不会生成默认移动构造函数，就会有问题，导致代码很低效。
4. 析构函数如果不声明，永远会自动生成。显然对象必须析构。

### Base11：C++中的异常处理与swap & copy

![base11](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base11.webp)

1. 异常处理的手段

   抛出异常：throw 异常； 然后给调用者，层层递进。

   接住异常：catch异常，尽量用引用接住。

   如果异常是因为内存不足导致的，那么catch时还是用copy的话可能会出现意想不到的问题。
2. 异常类型不确定可以使用 …
3. 异常可以递归抛出。
4. 栈展开。异常抛出之后，栈的临时变量会被销毁。**栈展开发生在catch**的时候，如果没有东西catch，那么不会进行栈展开。
5. **构造函数的 try catch**需要把列表初始化中的给括住。
6. 异常安全保证：

   1. **不抛出保证**：不抛出异常。

      **noexcept （constexpr bool）关键字**保证不会抛出异常，如果确定这个函数确实不会出现异常。

      但如果声明了 noexcept （constexpr bool）却抛出了异常，那么会直接崩溃。

      **`void gunc () noexcept(noexcept(func(a, b)));`** 表示如果 func(a, b) 不抛出异常则 gunc 函数不抛出异常。

      **noexcept 关键字可以是 bool 表达式**
   2. **强异常保证**：抛出异常，状态不变，相当于没有执行。
   3. 弱异常保证：状态改变，但是状态合理。
7. 构造函数如果抛出了异常，那么应该认为对象没有创建出来。

   也就是构造函数相当于没有执行，因此对应的析构函数也没有执行。

   也就是说，构造函数应该提供强安全保证。
8. **copy and swap**

   operator=(T other) 这里改为临时的变量，然后直接swap，可以**强异常保证**

   使用copy and swap可以容易的实现强异常保证。
9. 关于swap函数，使用友元，然后在函数体中 `using std;` 并且直接使用 swap 而不是 std::swap

   这点在effective C++有说，也就是编译器优先匹配的问题。

## 条款十四：如果函数不抛出异常请使用 noexcept

![item14](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item14.webp)

1. 一些容器如果移动构造函数**不是 noexcept 的话**，那么**不会去调用移动构造函数。**

## 条款十：优先考虑限域 enum 而非未限域 enum

![item10](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item10.webp)

1. enum 中的数字可以相等

   |  |
   | --- |
   | ```cpp
enum Color {
   	block = 0;
   	white = 0; // 这是允许的
   };
``` |
2. 未限域的 enum

   * 默认是**全局的**，可能会导致污染。

     enum A {a, b}; enum B {b, c};
   * **可隐式转换成整型**。 而且如果把一个范围外的整型强制转化为 enum 是奇怪的。
   * 通常情况下**无法前置声明**，因为不知道分配多大大小，即使指明 short，int 长度也不行。必须指明都有什么。
3. 限域的 enum，相当于变成了一个类型。

   并且默认是int，可以得知分配的大小。

   同时避免了隐式转换。

   可以通过使用**模板函数的方法来进行显示转化。**

   |  |
   | --- |
   | ```cpp
enum class Color {
   	
   }; // 即可，就是限域的 enum
``` |
4. enum 类型**不能直接支持成员函数。**

   但是可以：

   |  |
   | --- |
   | ```cpp
class Color {
   public:
   	enum Value : int {
   		Block = 0,
   		White,
   	}; // 下略
   private:
   	Value value_;
   }
``` |

   来同时支持限域枚举和成员方法。
5. 可以用列表初始化有定义整形的枚举类型。
6. 可以通过 using 来打开枚举的限域。

### Base12: 友元

1. 友元，让一个函数或者一个类来访问另一个类的私有部分。
2. 友元不是一个好的编码风格，但是更加灵活。
3. 友元函数和友元类是在**被访问的类**中进行声明的。
4. 友元的声明在 public 和 private 都是可以的。

## 条款十一：优先考虑使用 delete 函数而非使用未定义的私有声明

![item11](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item11.webp)

1. 原因很简单：

   **未定义的私有声明可能会被访问：友元。**

   虽然会出现错误，但是这是一个链接上的错误，不直观。
2. 把删除的函数，放在 public 中可以更清楚的知道是因为函数被删除了，而不是因为无权限访问。
3. delete可以用来删除任何函数。可以用来删除全局函数。

   |  |
   | --- |
   | ```cpp
isLuck(int x); // 可能会出现 char -> int
   // 为了避免：
   isLuck(char) = delete;
``` |
4. **delete可以删除一个模板的示例化。**
5. delete 可以在类中删除一个指定的成员模板函数。避免传入不想要的类型。

## 条款十二：使用 override 声明重写函数

![item12&item13](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item12&item13.webp)

1. 重写函数其实不需要 override ，只需要：

   * 基类函数为 virtual
   * 函数名（析构除外），形参，常量性 必须一致。
   * 返回值类型与原类型必须兼容（不一定一致）
   * 引用限定符必须一致。

   但是报错不直观。

   添加 override 可以保证更加明确。
2. final：向虚函数加 final 可以防止派生类重写。
3. final： 用于类可以防止继承
4. **引用限定符：用于区分成员函数被左值对象调用还是右值对象调用。**

   |  |
   | --- |
   | ```cpp
class A {
   public:
   	get() &;  // 会被左值调用
   	get() &&; // 会被右值调用
   };
``` |

## 条款十三：优先使用 const\_iterator 而非 iterator

![item12&item13](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item12&item13.webp)

1. iterator 可以转化成 const\_iterator，但是 const\_iterator 不能转化为 iterator。因此一些做法会很怪异。
2. **cbegin 和 cend 可以通过想 begin 和 end 传入一个 const 容器获得。**

# 第四章：智能指针

### Base13：堆栈内存分配流程与内存泄漏

![base13](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base13.webp)

### Base14：C++申请内存的各种方法

![base14](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base14.webp)

1. malloc / free 的实现感觉 csapp 已经讲完了。
2. new / delete

   |  |
   | --- |
   | ```cpp
// new 等价于：
   void *ptr = operator new(sizeof(T));
   T *t = (T *)ptr;
   t->t();
   
   // delete 等价于：
   t->~t();
   operator delete(t);
``` |
3. `placement new` 给定地址原地构造。本身不会额外申请内存。
4. 修改类内的 `operator new/delete` 可以完全控制类的创建。

### Base15：重写operator new/delete 的意义

![base15](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base15.webp)

1. 内存碎片化。
2. malloc时间开销代价大。
3. `::operator new` 表示全局的new操作符。

### Base16：Array new，Array delete与std::allocator的引入

![base16](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base16.webp)

1. 对于new T[]； 如果没有delete [] T；而是delete T，那么 T[] 本身不会出现内存泄漏，但是 T 内部的内存可能会泄露。同时可能会出现崩溃。
2. 如果每个类都重载 new / delete 太臃肿了，那么可以使用 std::allocator 即可。

## 条款十八：对于独占资源使用std::unique\_ptr

![item18](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item18.webp)

1. 智能指针的自定义删除器

   删除器是可调用对象即可。

## 条款十九：对共享资源使用 std::shared\_ptr

![item19_1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item19_1.webp)

![item19_2](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item19_2.webp)

1. std::shared\_ptr 始终是 2 倍指针

   另一个指针指向 control block，因此他不会因为可调用对象的类型而变化大小，但是堆上的大小会发生变化。
2. **control block的生成时机**

   1. 使用make\_shared
   2. 通过unique\_ptr创建shared\_ptr
   3. 向shared\_ptr的构造函数中传入一个裸指针
   4. 其他时候永远不会生成 control block。-> 多个control block 会导致重复释放。
3. 如果两个共享指针构造时，指向同一个指针，那么可能会重复释放

   |  |
   | --- |
   | ```cpp
int *p = new int(10);
   {
   	std::shared_ptr<int> sp1(p);
   	std::shared_ptr<int> sp2(p);
   } // 这个时候 sp1, sp2 释放，p 被释放两次
``` |
4. 解决方法：RAII
5. 使用 this 指针作为 `std::shared_ptr` 构造函数实参的例子：

   将本身放入智能指针的容器中。

   **`shared_ptr` 托管的对象需要获得一个指向自己的 `shared_ptr`。**

   |  |
   | --- |
   | ```cpp
class T : public std::enable_shared_from_this<T>;
   // 使用 shared_from_this() 就可以得到一个指向自己的指针。
``` |
6. shared\_ptr 不支持数组，但是可以自定义删除器。

## 条款二十：当 std::shared\_ptr 可以悬空时使用 std::weak\_ptr

![item20](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item20.webp)

1. sweak\_ptr 不能单独存在，必须传入一个共享指针。
2. weak\_ptr 不能延长堆内存的生死，但是可以**知道堆内存是否生死 （调用 expired() ）**
3. weak\_ptr 也不能直接访问内存，必须要通过 **lock 方法创建一个 shared\_ptr 来访问**。
4. weak\_ptr 的作用：**监视者。**
5. 智能指针对资源有完全的控制权。而 weak\_ptr 不影响 shared\_ptr 的释放。

   比如：缓存。

   缓存过期就是 shared\_ptr 指针释放，但是我在缓存中不希望影响外部指针的释放。

   为了避免这种情况，可以使用 weak\_ptr。
6. 上面图中的 2 中所展示的，有一个所谓的**循环引用。**

## 条款二十一：优先考虑使用std::make\_unique和std::make\_shared而非new

![item21_1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item21_1.webp)

![item21_2](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item21_2.webp)

1. 避免异常问题，如果操作被打断，make\_shared 可以保证内存不会泄露。
2. make的局限

   * 删除器没办法传递
   * 无法通过 { } 初始化指向的对象，因为 { } 无法完美转发
   * 如果类中重载了 operator new / delete 使用 make\_shared **不会调用重载函数**，这个时候只能使用 shared\_ptr 或者 std::allocated\_shared.
   * 使用 `make_shared, T object 与 control block` 会一起申请，也会一起释放。

     **当 weak\_ptr 存在时，对象的销毁与内存释放之间的间隔时间可能很长。**

## 条款二十二：当使用Pimpl惯用法，请在实现文件中定义特殊成员函数

![item22](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item22.webp)

1. **`Pimpl 即 Point to Implementation`** 是减少代码依赖和编译时间的技巧。

   其基本思想是将一个外部可见类(visible class)的实现细节（一般是所有私有的非虚成员）放在一个单独的实现类(implementation class)中，而在可见类中通过一个私有指针来间接访问该实现类。

   |  |
   | --- |
   | ```cpp
// 使用Pimpl
   // 在头文件person.hpp中
   #include <memory>
   class Person {
    public:
     Person();
    private:
     // Person类的实现细节放置在该前向声明的实现类中。
     struct Impl;
     // 指向实现类Impl的私有指针
     std::unique_ptr<Impl> pimpl_;
   };
   
   // 在源文件person.cpp中
   #include "person.hpp"
   #include "basic_info.hpp"
   #include <string>
   #include <memory>
   struct Person::Impl {
     std::string name;
     std::string id;
     BasicInfo basic_info;
   };
   Person::Person() : pimpl_(std::make_unique<Impl>()) {}
``` |
2. **如果不在实现文件中实现特殊成员函数，生成的默认函数会导致编译不通过** 这是因为默认生成的代码已经在使用类型了实际上。

# 第五章：右值引用 移动语义 完美转发

## 条款二十四：区分通用（万能）引用与右值引用

![item24](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item24.webp)

**什么是通用引用？什么不是通用引用？**

1. 模板的通用引用 要求： T&& + 类型推导（必须是模板）
2. 可变参数模板的通用引用，要求： `Args &&…` + 类型推导
3. auto 的通用引用 要求：`auto &&/ auto &&…` + 类型推导

### Base17：C++的返回值优化

![base17_1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base17_1.webp)

![base17_2](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base17_2.webp)

[RVO 和 NRVO](https://pvs-studio.com/en/blog/terms/6516/)

1. **URVO**(Unknown Return Value Optimization)匿名返回值优化

   C++17以及之后，这是编译器必须遵守的规则。

   URVO不可被禁用。
2. **NRVO**(Named Return Value Optimization)具名返回值优化.

   但是，只有当实际返回的对象类型和根据函数签名返回的对象类型完全一致时，我们才能应用 NRVO。

   NRVO可以被禁用。

```cpp
std::vector<int> GetVector2() {   std::vector<int> result(1'000'000, 1);
return result;
}  void foo() {   auto vect = GetVector();
.... }  // 优化之后： void GetVector2(std::vector<int> *x) {   new (x) std::vector<int>(1'000'000, 0);
}  void foo() {   auto *x = static_cast<std::vector<int> *>(               alloca(sizeof(std::vector<int>)));
GetVector2(x);
....   delete x;
}
```


**返回值优化失效**

失效指 NRVO 失效，而不是 VRVO 失效。

1. 可能返回不同对象。

   |  |
   | --- |
   | ```cpp
   T func(bool f) {
   	T t1(1), t2(2);
   	/* do something both t1 and t2 */
   	if (f)
   		return t1;
   	return t2;
   }
   ``` |
2. 返回一个全局变量

   |  |
   | --- |
   | ```cpp
   T a;
   T fun() {
   	return a;
   } // 因为 a 是一个全局变量，即使返回也是左值
   // 也就是生命周期很长
   ``` |
3. 返回函数参数

   |  |
   | --- |
   | ```cpp
   T fun(T &t) {
   	return t;
   } // 与上面一样，是生命周期超过函数本身
   ``` |
4. 存在赋值行为

   |  |
   | --- |
   | ```cpp
   T fun() {
   	return T(10);
   }
   
   void foo() {
   	T result(20);
   	result = fun();
   }
   
   // 因为存在 result 的反复初始化。肯定不能优化
   // 而且直接赋值也更符合这段代码的逻辑。
   ``` |
5. 返回成员变量

   和2、3一样，都是生命周期长于函数本身
6. 使用std::move()返回

   |  |
   | --- |
   | ```cpp
   T fun() {
   	T t(10);
   	return std::move(t);
   }
   
   void foo() {
   	T result = fun();
   }
   
   // 因为编译器不能改变行为，有move就必须move
   // 而且因为编译器不能轻易猜测函数的行为（move的行为）
   // 这就导致了编译器的无法优化
   ``` |

## 条款二十五：对右值引用使用std::move，对通用（万能）引用使用std::forward

![item25](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item25.webp)

1. const 引用与右值引用重载提高效率。
2. 使用通用引用可以更好的完成任务。
3. 返回万能引用用forward，返回右值引用用move

### Base18：emplace\_back与push\_back

![base18](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base18.webp)

1. push\_back 是模板，但不是通用引用。

   重载两个函数来区分右值和左值。
2. **emplace\_back 是可变参数模板，可以区分左右值，一定是万能引用。**
3. 编译器时间的对比，emplace\_back时间更长，因为是一个一个模板。

## 条款二十六：避免在通用引用上重载

![item26](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item26.webp)

1. 通用引用普通函数的重载。

   主要原因在于隐式转换，因为多个int类型之间存在隐式转换。
2. 通用引用构造函数的重载。

   主要原因在于 const 修饰和 右值类型 不完全匹配，导致走上不希望的函数。
3. 在 2 的基础上加上继承。

   也是因为类型的不完全匹配，导致不希望的函数。

**总结：不完全的匹配导致走向通用引用产生意料之外的结果。**

### Base19：模板元编程初探，SFINAE，enable\_if

![base19](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base19.webp)

1. 元(meta)的含义： meta X = X about X

   模板元编程：用模板编写程序的程序

   模板元函数：编译期执行且输入输出都可为数值（只能为bool或者整型），也可以为类型。

   编译期间执行
2. **SFINAE 替换失败并非错误**

   写一个明显错误的东西，但是替换失败并不报错，让一个函数永远不会被调用。只是让一个万能引用不会被匹配上。
3. **enable\_if**

 通过让匹配模板有时能匹配上，有时匹配不上，来排除和选择。

 **enable\_if<condition>::type 来获得类型。**

## 条款四十一：对于移动成本低且总是被拷贝的可拷贝形参，考虑按值传递

![item41](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item41.webp)

## 条款二十七：熟悉通用引用重载的替代方法。

![item27_1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item27_1.webp)

![item27_2](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item27_2.webp)

1. 使用按值传递。
2. 使用 tag dispatching

   用一个包装函数包裹工作函数，工作函数添加一个 `std::false_type / std::true_type`来重载，使用模板来区分到底走到那个函数

   例如：`std::is_inegral` 判断是否是整型

   **局限性：没有对本体重载。**
3. 使用 enable\_if 的条件判断类型实现重载函数的选择。

## 条款二十八：理解引用折叠

![item28](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item28.webp)

1. 引用折叠规则：

   如果任一引用为左值引用，结果为左值引用。

   **否则，引用都是右值引用。**
2. auto、模板实例化、typedef、decltype

## 条款二十九：假定移动操作不存在，成本高，未被使用

![item29](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item29.webp)

1. std::string 在小字符串时，不在堆上管理，而是在栈上管理。
2. 如果移动操作没有声明 noexcept 的话，那么移动操作可能不会被采用。
3. std::array 不会在堆上分配。

### Base20：C++中的extern与static关键字

![base20_1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base20_1.webp)

![base20_2](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base20_2.webp)

1. **变量的声明必须使用 extern** ，extern不可省略，同时变量不可赋值，否则为定义。

## 条款三十：熟悉完美转发失败的情况

![item30_2](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item30_2.webp)

![item30_1](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item30_1.webp)

1. 模板函数推导不了大括号。
2. 0 / NULL 作为空指针
3. 仅声明而未定义的 static const 数据成员。
4. 重载函数名称上模板函数参数，因为**重载函数名字一样，而类型不一样。**
   * 解决方法：用函数指针来**阻止函数同名不同人。**
5. 位域，我也没用过，很多时候也就是用 union

# 第六章：Lambda 表达式

## 条款三十一：避免使用默认捕获模式

![item31](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item31.webp)

1. 引用捕获时，注意生命周期
2. 默认按值捕获类内属性，要**考虑 this 指针**引发的问题。
3. 默认按值捕获，要小心局部 static 变量的依赖。

   * 因为捕获不到 static 变量，而是可以直接访问的。
   * **那么这个时候相当于引用捕获 static 变量，如果进行修改，可能会出现不可意料的问题。**

### Base21：std::bind 初探

![base21](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/base21.webp)

1. std::bind 的 `std::placeholders::_x`顺序是有讲究的。
2. 可以绑定成员函数，但是需要传入指针。
3. **当传入 std::bind 传入引用 std::ref(x)，传入右值 std::move(x)**

## 条款三十二：使用初始化捕获来移动对象到闭包中

![item32](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item32.webp)

## 条款三十三：对auto &&形参使用 decltype 以 std::forward 它们

![item33](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item33.webp)

1. 泛型 lambda 使用 auto x 类似于一个模板。
2. 使用 forward 对参数进行转化。

   `std::forward<delctype(x)>(x);`

## 条款三十四：考虑`lambda`而非`std::bind`

![item34](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item34.webp)

1. `lambda` 比 `std::bind` 更易读

   `bind`的参数是立刻执行的。
2. 当存在函数重载时 `bind` 有问题

   一个是不易读，不易写。

 一个是性能不好。直接使用的是函数指针，而不是函数本身。

3. 功能稍微复杂，很麻烦
4. **在C++11的时候，lambda 不支持 移动捕获。也不支持 auto &&**

   但是在C++11之后，lambda 就支持了，所以 bind 就可以完全被替代了。

# 第八章：`tweaks`

## 条款四十二：考虑使用置入代替插入

![item42](/img/%E9%80%9F%E9%80%9Aeffective-modern-cpp/item42.webp)

1. 能够在内存中直接调用构造函数，这样就避免了构造、拷贝、析构。否则，其实和插入性能差异不大。
2. 容器不拒绝重复项新值，比如`map`的话，可能`emplace`意义不大。
3. 如果需要管理内存，插入可能比置入更安全。
4. 与 `explicit` 的交互，其意义可能就是希望拒绝隐式转换，但是 `emplace` 允许参数是隐式的，这在语义上可能有矛盾。
