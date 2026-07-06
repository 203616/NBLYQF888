Component({
  properties: {
    text: String,   // 标签文本内容
    type: {         // 标签类型（用于样式控制）
      type: String,
      value: 'primary'
    }
  },
  
  externalClasses: ['custom-class'],  // 支持外部样式
});