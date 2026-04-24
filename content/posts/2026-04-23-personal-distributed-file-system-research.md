---
title: 个人多设备分布式文件系统/NAS 项目调研
date: 2026-04-23T23:50:00+08:00
lastmod: 2026-04-23T23:50:00+08:00
tags:
- 分布式系统
- 文件系统
- NAS
- Self-hosted
- P2P
categories:
- 技术调研
slug: personal-distributed-file-system-research
featureimage: "images/covers/personal-distributed-file-system-research.webp"
summary: 调研面向个人电脑、手机再利用的多节点文件服务方案，比较 GlusterFS、RetroShare、D-LAN、Tahoe-LAFS、SeaweedFS、Syncthing、Peergos、Spacedrive、IPFS/Kubo、JuiceFS 等项目与“多节点提供服务、内网可用、最好去中心化、最好有安卓端、不追求容灾”的匹配程度。
---

<!--more-->

## 背景

我想做或寻找的是一个面向个人/家庭的多设备文件系统：把个人已有的电脑、手机、旧主机重新利用起来，组成一个类似 NAS 的系统。

核心需求为下面几条：

| 编号 | 需求 | 说明 |
| --- | --- | --- |
| 1 | 不进行容灾与备份 | 文件只存一份。但是一台机器出现故障时，只应影响本机，不会影响其他机器上的文件的访问。|
| 2 | 多个节点均可提供服务 | 不希望只是“一台 home server + 其他客户端/镜像”。更希望多台机器都能贡献自己的存储或共享目录。最好可以跨平台，至少需要支持 Linux |
| 3 | 最好可以去中心化 | 不强制完全无中心，但希望减少固定中心节点、固定公网服务、固定云服务依赖。 |
| 4 | 最好有 Android 端 | Android 可以是完整节点，也可以是 App、WebDAV、SFTP、SMB 等访问端。 |
| 5 | 可以通过内网提供服务 | 主要场景是家庭 LAN，不要求公网可访问。 |
| 6 | 统一命名空间 | 多台机器组成一个统一的文件服务，尽量像访问一套文件系统或网络盘 |
| 7 | 多节点持续提供文件服务| 不是 “临时传文件” 的工具，要求可以持续提供服务 |

## 排序结论

排序依据不是项目知名度，而是与上述需求的综合匹配程度。这里把“像 NAS/文件系统”也作为隐含加分项，因为原始目标不是单纯传文件，而是复用多台设备形成长期可访问的个人文件服务。

| 排名 | 项目 | 综合判断 |
| --- | --- | --- |
| 1 | GlusterFS | 最像“多台机器共同提供一个文件系统”。distributed volume 可无冗余，符合“不追求容灾”。主要短板是移动端和非 Linux 桌面端体验。 |
| 2 | RetroShare | 去中心化、多节点都能共享文件，且有 Android/Windows/macOS/Linux 线索。更像 P2P 文件共享网络，不像 NAS。 |
| 3 | D-LAN | 非常贴近“局域网多节点文件共享，无中心，自动发现”。但项目偏老，没有成熟 Android 端，跨平台有限。 |
| 4 | Tahoe-LAFS | 多 storage server 共同提供服务，去中心化存储网格成熟。问题是默认围绕容灾/纠删码设计，Android 弱，使用复杂。 |
| 5 | SeaweedFS | 多 volume server、FUSE、WebDAV、S3 都有，内网搭建能力强。缺点是有 master/filer 等协调角色，不是去中心化。 |
| 6 | Syncthing / Syncthing-Fork | 最成熟的 P2P 多设备同步方案，Android 端可用性好。但它是同步，不是“只由原节点提供文件服务”。 |
| 7 | Peergos | 自托管、Android、FUSE、WebDAV、加密都很好。缺点是更接近 home server 模型，不适合“多节点都作为独立存储服务”。 |
| 8 | Spacedrive | 最符合需求。架构理念最像“文件留在原处，统一索引，多设备视图”。但官方产品文档仍标记节点连接/数据库同步为 WIP。 |
| 9 | IPFS / Kubo | 真正 P2P 内容寻址网络，多节点可提供内容。问题是它不是传统文件系统/NAS，Android 原生节点体验弱。 |
| 10 | JuiceFS | POSIX、WinFsp、对象存储、元数据引擎都成熟。更适合云原生共享文件系统，不贴近去中心化个人多设备。 |

如果只看“个人 NAS/文件系统”这个目标，优先看 GlusterFS。  
如果只看“去中心化 + Android + 多节点共享文件”，优先看 RetroShare。  
如果想做自己的项目，最值得参考的是 Spacedrive 的“文件留在原处 + 元数据统一索引”思路。

## 1. GlusterFS

- 官网：[https://www.gluster.org/](https://www.gluster.org/)
- 文档：[Gluster Docs](https://docs.gluster.org/en/latest/)
- 架构文档：[Architecture](https://docs.gluster.org/en/latest/Quick-Start-Guide/Architecture/)

GlusterFS 是一个开源的可扩展网络文件系统。官方文档描述它可以把多台服务器上的磁盘资源聚合成一个全局命名空间，并且可以使用普通的底层磁盘文件系统，只要底层支持扩展属性。

最符合本需求的是它的 distributed volume。这个模式会把文件分布到多个 brick 上，一个文件通常只在其中一个 brick 上，不做副本。因此它天然符合“不追求容灾，只想把容量拼起来”的思路。官方文档也明确说明 distributed volume 没有数据冗余，brick 故障会导致对应数据丢失。

**特点**

- 以 volume 抽象聚合多个 brick。
- brick 可以来自不同服务器的本地磁盘目录。
- 客户端通过 FUSE 挂载统一命名空间。
- distributed volume 默认不做复制，适合容量聚合。
- 也支持 replicated、dispersed 等带冗余模式，但本文场景不需要。

**优点**

- 最像真正的“多节点 NAS/文件系统”。
- 多台机器都能提供存储，不是单主存储。
- distributed volume 可以不做冗余，符合“节点离线则该节点数据不可用”的接受模型。
- 复用普通服务器和普通本地文件系统。
- 适合内网环境。

**缺点**

- 主要面向 Linux 服务器生态。
- Windows/macOS/Android 一般需要通过 SMB、NFS、WebDAV 网关间接访问。
- 家用异构设备、手机直接加入集群的体验较弱。
- 节点离线、brick 丢失、split-brain、权限、性能调优都需要一定运维能力。

**匹配判断**

如果目标是“真的拼出一个网络文件系统”，GlusterFS 是最符合的现成项目。它不是最去中心化的 P2P 项目，但它比 Peergos、Syncthing 更像 NAS，也比 SeaweedFS/JuiceFS 更少依赖对象存储和中心元数据服务。

## 2. RetroShare

- 官网：[https://retroshare.cc/](https://retroshare.cc/)
- GitHub：[RetroShare/RetroShare](https://github.com/RetroShare/RetroShare)
- 文档：[RetroShare Docs](https://retrosharedocs.readthedocs.io/en/latest/about/about/)

RetroShare 是一个去中心化、加密的 Friend-to-Friend/P2P 通信与文件共享平台。它不只是文件共享，还包含聊天、消息、论坛、频道等功能。官网和文档都强调它没有中心服务器，数据在朋友节点之间传输。

它与本文需求的最大契合点是：每个节点都可以共享自己的文件，其他节点可以搜索、浏览、下载。它不是把多台设备挂成一个文件系统，而是提供一个去中心化文件共享网络。

**特点**

- Friend-to-Friend 网络，而不是公开匿名下载站。
- 文件共享、搜索、聊天、论坛等功能集成在同一系统。
- 设计上没有中心服务器。
- 支持跨平台桌面端，文档和资料中也能看到 Android 相关构建与使用线索。

**优点**

- 去中心化程度高。
- 多个节点都能提供文件。
- 适合朋友、家庭、小圈子共享文件。
- 不要求所有文件同步到所有设备。
- 安全和隐私设计比普通 LAN 共享工具更强。

**缺点**

- 不像 NAS，也不提供标准 POSIX 文件系统挂载语义。
- 使用模型偏“搜索/下载/共享”，而不是“打开一个统一盘符直接读写”。
- 功能面比个人文件服务更复杂。
- Android 体验需要进一步实测，不能只看是否存在相关构建文档。

**匹配判断**

如果放弃“像文件系统一样挂载”的要求，RetroShare 是非常值得试的候选。它比 GlusterFS 更去中心化，也更接近“每台设备都是服务节点”，但它不是统一文件系统。

## 3. D-LAN

- 官网：[https://www.d-lan.net/](https://www.d-lan.net/)
- GitHub：[Ummon/D-LAN](https://github.com/Ummon/D-LAN)
- 技术说明：[General approach](https://dev.d-lan.net/projects/pmp/wiki/General_approach)

D-LAN 是一个开源的局域网去中心化文件共享软件。它的目标非常直接：在 LAN 环境中自动发现其他人共享的文件和文件夹，不需要特殊配置，也不需要中心服务器。

这和“内网、多节点均可提供服务、不追求公网”的场景非常贴近。技术说明里描述了它通过 UDP multicast 发现 peer，通过文件 chunk 和 hash 做多源下载与完整性识别。

**特点**

- 面向局域网。
- 无中心服务器。
- 自动发现其他 peer。
- 可以浏览其他 peer 的共享文件夹。
- 支持搜索、下载队列、多源下载。
- 可无图形界面运行并远程控制。

**优点**

- 和“家庭内网多台设备共享文件”高度一致。
- 不强制复制所有文件。
- 不需要复杂账号体系。
- 比 RetroShare 更轻量，更偏 LAN 文件服务。

**缺点**

- 项目偏老，技术栈是 C++/Qt4。
- 主要看到 Windows/Linux 支持，Android 端缺失。
- 不像 NAS，不提供标准文件系统挂载。
- 更像局域网文件浏览/下载工具，而不是可长期维护的现代个人云。

**匹配判断**

D-LAN 是“概念非常贴近，但生态和活跃度不足”的候选。如果只是在内网中浏览和下载多台电脑上的共享文件，它很符合；如果要长期作为未来项目底座，需要谨慎。

## 4. Tahoe-LAFS

- 官网：[https://www.tahoe-lafs.org/](https://www.tahoe-lafs.org/)
- 当前主页：[https://home.of.tahoe-lafs.org/](https://home.of.tahoe-lafs.org/)
- 文档：[Tahoe-LAFS Docs](https://tahoe-lafs.readthedocs.io/en/latest/)
- 配置文档：[Configuring a Tahoe-LAFS node](https://tahoe-lafs.readthedocs.io/en/latest/configuration.html)
- SFTP 前端：[FTP and SFTP frontend](https://tahoe-lafs.readthedocs.io/en/latest/frontends/FTP-and-SFTP.html)

Tahoe-LAFS 是一个自由、开源、去中心化的云存储系统。它会把数据分布到多个 storage server 上，核心目标是隐私、安全和容错。客户端上传文件时，会把文件加密并切成多个 share，然后分散存储。

从“多台机器都能作为存储节点”的角度看，它比 Peergos 更符合；从“不需要容灾”的角度看，它又显得过重。官方配置中的 shares.needed、shares.total、shares.happy 可以调整冗余和恢复参数，但 Tahoe-LAFS 的核心设计仍然围绕纠删码和多服务器恢复。

**特点**

- 多 storage server 组成 grid。
- 客户端加密，服务端不需要被信任。
- 文件被切成多个 share。
- 可通过 Web UI、CLI、SFTP/FTP 前端访问。
- Windows、macOS、Linux 安装路径都有官方文档。

**优点**

- 多节点存储模型真实存在，不是单主 + 镜像。
- 去中心化和安全性强。
- 可以在自己的内网里搭 grid。
- SFTP 前端可以间接配合 sshfs 挂载。

**缺点**

- 默认就是为容灾和安全云存储设计，复杂度高于需求。
- 不像普通 NAS，POSIX 体验有限。
- Android 端路线不强。
- introducer、grid、share 参数、gateway 等概念对家庭用户偏重。

**匹配判断**

Tahoe-LAFS 是“多节点提供服务”这一项的强候选，但它不是轻量个人 NAS。除非特别看重去中心化安全存储，否则它可能比实际需求复杂。

## 5. SeaweedFS

- 官网：[https://seaweedfs.org/](https://seaweedfs.org/)
- GitHub：[seaweedfs/seaweedfs](https://github.com/seaweedfs/seaweedfs)

SeaweedFS 是一个分布式存储系统，支持对象存储、文件系统和数据湖工作负载。它的工程能力很强：volume server 可以水平扩容，filer 提供目录/文件视图，还支持 S3、FUSE、WebDAV、HDFS 等访问方式。

官方 README 中说明，SeaweedFS 可以通过增加 volume server 扩容；filer 可以通过 HTTP 提供正常目录和文件；mount filer 可以通过 FUSE 挂载；WebDAV 可以在 Mac/Windows 上作为映射盘，也可以供移动设备访问。

**特点**

- master 管 volume，volume server 存实际数据。
- filer 提供类文件系统目录。
- 支持 S3、FUSE、WebDAV、Hadoop Compatible File System。
- 可以增加多台 volume server 扩容。
- 面向大量小文件和高性能访问。

**优点**

- 很适合内网搭一个多节点文件服务。
- WebDAV 对 Android/iOS 访问友好。
- FUSE 和 S3 让接入方式丰富。
- 单机和多机都能跑，部署灵活。
- 不强制做多副本，复制策略可配置。

**缺点**

- 有 master/filer 等明确协调角色，不是去中心化。
- 更像分布式对象/文件存储后端，不是个人设备原地共享。
- 如果 master/filer 设计不当，会有中心组件可用性问题。
- 对普通家庭用户来说，概念仍然偏服务端。

**匹配判断**

如果接受中心协调层，SeaweedFS 比 Tahoe-LAFS 更工程化、比 GlusterFS 更适合 WebDAV/S3 生态。但它不满足“最好去中心化”的偏好。

## 6. Syncthing / Syncthing-Fork

- 官网：[https://syncthing.net/](https://syncthing.net/)
- GitHub：[syncthing/syncthing](https://github.com/syncthing/syncthing)
- Local Discovery：[Local Discovery Protocol](https://docs.syncthing.net/v1.23.5/specs/localdisco-v4.html)
- Relay 文档：[Relaying](https://docs.syncthing.net/users/relaying.html)
- Android Fork：[Syncthing-Fork on F-Droid](https://f-droid.org/en/packages/com.github.catfriend1.syncthingfork/)

Syncthing 是非常成熟的开源连续文件同步工具。它可以在 LAN 和 Internet 中同步多台设备上的文件，支持本地发现、全局发现、relay，也支持端到端加密传输。Android 官方包装器已停止维护，但社区维护的 Syncthing-Fork 在 F-Droid 上仍可用。

它的问题也很明确：Syncthing 的核心是同步，而不是远程按需访问。一个目录被共享后，各节点通常会保存自己的副本。这与“不追求备份、不希望复制、只想多个节点分别提供各自文件”的模型不完全一致。

**特点**

- P2P 文件同步。
- 支持 LAN 本地发现。
- 支持 relay，但 relay 只转发加密流量。
- Android 可通过 Syncthing-Fork 使用。
- 成熟、稳定、社区大。

**优点**

- 多平台成熟度最高之一。
- Android 可用性比大多数分布式文件系统强。
- 内网同步体验好。
- 安全模型清晰，不依赖云盘。
- 适合照片、文档、配置文件、Obsidian 仓库等场景。

**缺点**

- 本质是同步，会产生副本。
- 不提供统一命名空间。
- 不适合把大量冷数据只留在原机器上按需读取。
- Android 后台限制、存储权限、电池优化仍可能影响体验。

**匹配判断**

如果可以接受“复制副本”，Syncthing 是最实用的日常方案。但在本文需求里，它只能作为补充工具，而不是主方案。

## 7. Peergos

- 官网：[https://peergos.org/](https://peergos.org/)
- GitHub：[Peergos/Peergos](https://github.com/Peergos/Peergos)
- 自托管文档：[Self hosting](https://book.peergos.org/features/self)
- WebDAV：[WebDAV](https://book.peergos.org/features/webdav.html)
- 文件同步：[File Sync](https://book.peergos.org/features/sync.html)
- 下载页：[Download](https://peergos.org/download)

Peergos 是一个 P2P、端到端加密的文件存储、社交网络和应用协议。它支持自托管，可以使用本地文件 blockstore，也可以使用 S3；元数据可以用 sqlite 或 postgres。官方下载页提供 Android、Windows、macOS、Linux 客户端。它还提供 FUSE、WebDAV、CLI 和双向文件同步。

Peergos 一开始看起来最符合“个人加密分布式文件空间”。但深入看，它更接近“每个用户有自己的 home server，其他节点/服务器可以访问、代理、镜像或迁移”。官方开发文档中也提到修改请求会被代理到 owner 的 storage node。

**特点**

- 端到端加密。
- 支持自托管。
- 支持本地磁盘作为 blockstore。
- 支持 Android、桌面端、WebDAV、FUSE。
- 支持本地目录与 Peergos 目录双向同步。

**优点**

- 作为成品，功能完整度很高。
- 不用官网付费托管也能自建。
- Android 和 WebDAV 对个人使用友好。
- 隐私和加密设计强。
- 比 Tahoe-LAFS 更像个人云产品。

**缺点**

- 不符合“多台机器都作为独立存储服务共同承载同一命名空间”的偏好。
- 更像 home server + 客户端/镜像/迁移模型。
- 如果不需要分享、社交、应用协议，加密社交层可能显得过重。
- 文件进入 Peergos 自己的存储层，不是纯粹把已有目录原地拼接。

**匹配判断**

如果目标变成“自托管个人加密云盘”，Peergos 很强。如果目标坚持“多节点各自贡献存储，并且没有主存储节点”，Peergos 排名会下降。

## 8. Spacedrive

- 官网：[https://www.spacedrive.com/](https://www.spacedrive.com/)
- GitHub：[spacedriveapp/spacedrive](https://github.com/spacedriveapp/spacedrive)
- VDFS/FAQ：[Spacedrive FAQ](https://www.spacedrive.com/docs/product/resources/faq)
- Nodes 文档：[Nodes](https://www.spacedrive.com/docs/product/guides/nodes)
- Database Sync：[Database Sync](https://www.spacedrive.com/docs/product/guides/database-sync)

Spacedrive 是一个开源跨平台文件管理器，核心概念是 Virtual Distributed Filesystem。它的理念非常贴近本文最初的想法：文件仍然留在原来的位置，系统通过索引、内容哈希、元数据同步，把多设备、多位置的数据统一到一个视图中。

但是它当前的产品文档明确把 Nodes 和 Database Sync 标为 WIP，并说明当前还不能连接 Nodes。因此它更适合作为架构参考，而不是现成可部署方案。

**特点**

- 文件留在原处，系统做索引和统一视图。
- 通过内容哈希识别文件。
- 目标是跨设备、P2P、无云中心。
- 支持 Windows、Linux、macOS、iOS、Android 的产品方向。
- 当前多节点连接和数据库同步仍未成熟可用。

**优点**

- 架构理念最接近“原地目录 + 统一命名空间”。
- 不强迫把文件导入新的存储池。
- 适合启发自研项目。
- UI/产品形态更接近个人用户。

**缺点**

- 当前不能当成成熟多节点方案依赖。
- 不是 OS 级网络文件系统。
- 关键能力仍在路线图/WIP。
- 如果要做 NAS 挂载层，需要额外设计 FUSE/WinFsp/WebDAV。

**匹配判断**

Spacedrive 不是现在最可用的项目，但它是最值得学习的方向。如果未来要自己做项目，它的核心思想比传统分布式文件系统更贴近“个人设备再利用”。

## 9. IPFS / Kubo

- 官网文档：[IPFS Docs](https://docs.ipfs.tech/)
- Kubo 安装：[Kubo command line](https://docs.ipfs.tech/install/command-line/)
- Kubo GitHub：[ipfs/kubo](https://github.com/ipfs/kubo)
- IPFS 工作原理：[How IPFS works](https://docs.ipfs.tech/concepts/how-ipfs-works/)

IPFS 是内容寻址的 P2P 网络。Kubo 是 Go 语言实现的 IPFS 节点。每个节点可以提供自己 pin 或持有的内容，其他节点通过 CID、DHT、Bitswap、mDNS 等机制找到并请求内容。官方文档说明 mDNS 可以在没有互联网和 bootstrap 节点的局域网中发现 IPFS 节点。

它符合“多个节点均可提供服务”和“去中心化”的方向，但它不符合传统 NAS 的使用方式。IPFS 的核心是内容地址，不是路径地址；文件更新、目录命名、权限、删除、移动、按路径读写都需要额外层来处理。

**特点**

- 内容寻址。
- P2P 发现和传输。
- 支持 LAN mDNS。
- Kubo 支持 Windows、macOS、Linux、FreeBSD、OpenBSD。
- 可以通过本地 gateway 用 HTTP 访问内容。

**优点**

- 去中心化程度高。
- 多节点都可以提供内容。
- 很适合不可变内容、归档、分发。
- 内网可以只用本地发现。
- 可作为自研系统的底层内容分发层参考。

**缺点**

- 不是传统文件系统。
- 目录更新和可变命名需要 IPNS 或额外索引。
- Android 原生完整节点体验弱。
- 对普通用户来说，CID 模型不如文件路径直观。
- FUSE/挂载体验不是它最成熟的使用路径。

**匹配判断**

IPFS 更像“内容分发网络”，不是“个人 NAS”。如果自研项目需要内容寻址、去重、P2P 传输，可以借鉴；如果要现成文件服务，不优先。

## 10. JuiceFS

- 官网：[https://juicefs.com/](https://juicefs.com/)
- GitHub：[juicedata/juicefs](https://github.com/juicedata/juicefs)
- Windows 文档：[Using JuiceFS on Windows](https://juicefs.com/docs/community/tutorials/windows)
- 元数据引擎：[How to Set Up Metadata Engine](https://juicefs.com/docs/community/databases_for_metadata)

JuiceFS 是一个云原生分布式 POSIX 文件系统，数据通常存到对象存储，元数据存到 Redis、MySQL、TiKV、SQLite 等元数据引擎。它支持 POSIX、HDFS、S3 等协议，Windows 上依赖 WinFsp 挂载。

JuiceFS 的工程成熟度很高，但它解决的问题更像“在对象存储之上提供 POSIX 文件系统”，而不是“把个人多台设备的本地磁盘原地组织成去中心化文件服务”。

**特点**

- POSIX 文件系统。
- 数据和元数据分离。
- 数据落在对象存储。
- 元数据使用独立数据库。
- Windows 通过 WinFsp 挂载。

**优点**

- POSIX 体验好。
- 跨平台挂载能力比很多传统系统强。
- 适合云原生、Kubernetes、大数据、对象存储场景。
- 文档成熟，生态清晰。

**缺点**

- 需要元数据引擎和对象存储，中心化组件明显。
- 不是去中心化。
- 不适合让每台个人设备直接贡献原生目录。
- Android 只能通过网关间接访问。

**匹配判断**

JuiceFS 是好文件系统，但不是本文需求的优先答案。它更适合“我有对象存储/MinIO/S3，希望挂成 POSIX 文件系统”，而不是“我有几台旧电脑和手机，想拼一个去中心化个人 NAS”。

## 项目对照表

| 项目 | 多节点提供服务 | 去中心化 | Android | 内网可用 | 是否像 NAS/文件系统 | 是否避免冗余 |
| --- | --- | --- | --- | --- | --- | --- |
| GlusterFS | 强 | 中 | 弱 | 强 | 强 | 强，distributed volume 无冗余 |
| RetroShare | 强 | 强 | 中 | 中 | 弱 | 强，不强制复制 |
| D-LAN | 强 | 强 | 弱 | 强 | 中弱 | 强，不强制复制 |
| Tahoe-LAFS | 强 | 强 | 弱 | 强 | 中 | 中，可调参数但核心偏容灾 |
| SeaweedFS | 强 | 弱中 | 中，靠 WebDAV | 强 | 强 | 中，可配置复制策略 |
| Syncthing | 强 | 强 | 强，靠 Syncthing-Fork | 强 | 弱 | 弱，核心是同步副本 |
| Peergos | 中 | 中 | 强 | 强 | 中 | 中，更偏 home server |
| Spacedrive | 目标强，当前弱 | 目标强 | 目标强 | 目标强 | 中 | 强，文件留原处 |
| IPFS/Kubo | 强 | 强 | 弱 | 强 | 弱 | 强，按节点 pin/持有内容 |
| JuiceFS | 中 | 弱 | 弱 | 强 | 强 | 中，取决于后端配置 |

## 最终结论

### Spacedrive 最符合需求

- 多平台
- 安卓可用
- 具备 GUI
- 复用本地文件系统
- 缺点暂不完善

### GlusterFS 折中选择

- distributed volume 和需求非常吻合：
- 多台机器各出磁盘，不做冗余，节点故障就损失/不可用对应数据。
- 缺点是 Android 和 Windows/macOS 的体验要通过 SMB/NFS/WebDAV 等网关补齐。

### Syncthing 最易用但不符合需求

- 多平台
- 具有 GUI
- 复用本地文件系统
- 但是缺点是强制进行复制同步，必须要有冗余备份；仅限局域网使用

### 选择

- 跟随 Spacedrive 并学习。若其可用，则改为 Spacedrive
- 目前使用 GlusterFS + tailscale + SMB 安卓访问的方案。

## 参考资料

- [GlusterFS 官网](https://www.gluster.org/)
- [GlusterFS Architecture](https://docs.gluster.org/en/latest/Quick-Start-Guide/Architecture/)
- [RetroShare 官网](https://retroshare.cc/)
- [RetroShare GitHub](https://github.com/RetroShare/RetroShare)
- [D-LAN 官网](https://www.d-lan.net/)
- [D-LAN GitHub](https://github.com/Ummon/D-LAN)
- [Tahoe-LAFS 官网](https://www.tahoe-lafs.org/)
- [Tahoe-LAFS 文档](https://tahoe-lafs.readthedocs.io/en/latest/)
- [SeaweedFS 官网](https://seaweedfs.org/)
- [SeaweedFS GitHub](https://github.com/seaweedfs/seaweedfs)
- [Syncthing 官网](https://syncthing.net/)
- [Syncthing GitHub](https://github.com/syncthing/syncthing)
- [Syncthing-Fork F-Droid](https://f-droid.org/en/packages/com.github.catfriend1.syncthingfork/)
- [Peergos 官网](https://peergos.org/)
- [Peergos 自托管文档](https://book.peergos.org/features/self)
- [Spacedrive 官网](https://www.spacedrive.com/)
- [Spacedrive GitHub](https://github.com/spacedriveapp/spacedrive)
- [IPFS 文档](https://docs.ipfs.tech/)
- [Kubo GitHub](https://github.com/ipfs/kubo)
- [JuiceFS 官网](https://juicefs.com/)
- [JuiceFS GitHub](https://github.com/juicedata/juicefs)
