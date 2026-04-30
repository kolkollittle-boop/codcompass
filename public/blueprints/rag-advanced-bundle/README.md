# RAG 架构进阶 - Blueprint 资源包

## 资源包内容

本资源包包含《RAG 架构进阶：处理 100GB 级别私有文档的索引与检索降噪》一文中提到的所有生产级配置和工具。

### 文件清单

| 文件 | 描述 |
|------|------|
| `docker-compose.yml` | 完整的向量数据库 + Re-ranking 服务部署配置 |
| `benchmark.py` | 性能基准测试脚本，支持 4 种方案对比 |
| `config_template.json` | 生产级参数配置模板 |
| `monitoring_dashboard.json` | Grafana 监控面板配置 |
| `hnsw_tuner.py` | HNSW 参数自动调优脚本 |
| `chunk_optimizer.py` | 语义边界切分优化工具 |

## 快速开始

### 1. 部署向量数据库

```bash
cd rag-advanced-bundle
docker-compose up -d
```

### 2. 运行基准测试

```bash
pip install -r requirements.txt
python benchmark.py --dataset /path/to/your/data
```

### 3. 配置生产参数

```bash
cp config_template.json config.json
# 编辑 config.json 根据你的需求
```

## 系统要求

- Docker 20.10+
- Python 3.10+
- 至少 16GB 内存（推荐 32GB+ 用于 100GB+ 语料库）
- SSD 存储（用于向量数据库索引）

## 支持

如有问题，请加入我们的 [Discord 社区](https://discord.gg/codcompass) 或发送邮件至 support@codcompass.com。
