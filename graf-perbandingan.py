import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np
import json

def load_metrics(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
    extracted = [{'Metric': k, **v} for k, v in data['metrics'].items()]
    return pd.DataFrame(extracted)

df_nosql = load_metrics('nosql-results.json')
df_sql = load_metrics('sql-results.json')

lat_nosql = df_nosql[df_nosql['Metric'] == 'http_req_duration'].iloc[0]
lat_sql = df_sql[df_sql['Metric'] == 'http_req_duration'].iloc[0]

metrics = ['Avg', 'Max']
nosql_vals = [lat_nosql['avg'], lat_nosql['max']]
sql_vals = [lat_sql['avg'], lat_sql['max']]

x = np.arange(len(metrics))
width = 0.35

fig, ax = plt.subplots(figsize=(9, 5.5))
fig.patch.set_facecolor('white')
ax.set_facecolor('#fafafa')

bars1 = ax.bar(x - width/2, nosql_vals, width, label='NoSQL', color='#378ADD', edgecolor='#185FA5', linewidth=0.8, zorder=3)
bars2 = ax.bar(x + width/2, sql_vals, width, label='SQL', color='#D85A30', edgecolor='#993C1D', linewidth=0.8, zorder=3)

def add_labels(bars):
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, h * 1.06,
            f'{h:,.0f}', ha='center', va='bottom',
             fontsize=9, color='#444')

add_labels(bars1)
add_labels(bars2)
ax.set_yscale('log')
ax.yaxis.set_major_formatter(ticker.FuncFormatter( lambda v, _: f'{int(v):,}' if v >= 1 else ''))
ax.set_ylim(bottom=50)

ax.yaxis.grid(True, which='both', linestyle='--', linewidth=0.5, color='#ccc', zorder=0)
ax.xaxis.grid(False)
ax.set_axisbelow(True)

ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color('#ccc')
ax.spines['bottom'].set_color('#ccc')

ax.set_xticks(x)
ax.set_xticklabels(metrics, fontsize=12)
ax.set_ylabel('Latency (ms) - log scale', fontsize=11, color='#555')
ax.set_title('Read Operation Stress Test: NoSQL vs SQL\nAvg and Max Latency', fontsize=13, fontweight='medium', pad=14, color='#222')

ax.legend(fontsize=11, frameon=False, loc='upper left')
plt.tight_layout()
plt.savefig('comparison_improved.png', dpi=300, bbox_inches='tight')
plt.show()

def get_metric(df, metric_name):
    row = df[df['Metric'] == metric_name]
    return row.iloc[0] if not row.empty else None

rps_nosql = get_metric(df_nosql, 'http_reqs')['rate']
rps_sql = get_metric(df_sql, 'http_reqs')['rate']

dr_nosql = get_metric(df_nosql, 'data_received')['rate'] / 1024
dr_sql = get_metric(df_sql, 'data_received')['rate'] / 1024

fig2, axes = plt.subplots(1, 2, figsize=(11, 5))
fig2.patch.set_facecolor('white')
fig2.suptitle('Read Operation Stress Test: NoSQL vs SQL\nThroughput', fontsize=13, fontweight='medium', color='#222', y=1.01)

db_labels = ['NoSQL', 'SQL']
bar_colors = ['#378ADD', '#D85A30']
edge_colors = ['#185FA5', '#993C1D']

def style_ax(a):
    a.set_facecolor('#fafafa')
    a.spines['top'].set_visible(False)
    a.spines['right'].set_visible(False)
    a.spines['left'].set_color('#ccc')
    a.spines['bottom'].set_color('#ccc')
    a.yaxis.grid(True, linestyle='--', linewidth=0.5, color='#ccc', zorder=0)
    a.xaxis.grid(False)
    a.set_axisbelow(True)

def add_bar_labels(a, bars, fmt='{:.1f}'):
    for bar in bars:
        h = bar.get_height()
        a.text(bar.get_x() + bar.get_width() / 2, h * 1.02, fmt.format(h), ha='center', va='bottom', fontsize=10, color='#444')

ax1 = axes[0]
b1 = ax1.bar(db_labels, [rps_nosql, rps_sql], width=0.45, color=bar_colors, edgecolor=edge_colors, linewidth=0.8, zorder=3)
add_bar_labels(ax1, b1)
style_ax(ax1)
ax1.set_ylabel('Requests / second', fontsize=11, color='#555')
ax1.set_title('Request Rate (req/s)', fontsize=12, color='#333', pad=10)
ax1.set_ylim(0, max(rps_nosql, rps_sql) * 1.25)

ax2 = axes[1]
b2 = ax2.bar(db_labels, [dr_nosql, dr_sql], width=0.45, color=bar_colors, edgecolor=edge_colors, linewidth=0.8, zorder=3)
add_bar_labels(ax2, b2, fmt='{:.1f}')
style_ax(ax2)
ax2.set_ylabel('KB / second', fontsize=11, color='#555')
ax2.set_title('Data Received Rate (KB/s)', fontsize=12, color='#333', pad=10)
ax2.set_ylim(0, max(dr_nosql, dr_sql) * 1.25)

plt.tight_layout()
plt.savefig('throughput_comparison.png', dpi=300, bbox_inches='tight')
plt.show()